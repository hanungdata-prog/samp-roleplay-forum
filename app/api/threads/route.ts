import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { z } from 'zod'

// Validation schema for creating threads
const createThreadSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  categoryId: z.string().uuid(),
  tagIds: z.array(z.string().uuid()).optional(),
})

// GET /api/threads - Get threads with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const authorId = searchParams.get('authorId')
    const isPinned = searchParams.get('isPinned')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (isPinned !== null) {
      where.isPinned = isPinned === 'true'
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Build order clause
    const order: any = {}
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      order[sortBy] = sortOrder
    } else if (sortBy === 'views') {
      order.views = sortOrder
    } else {
      order.createdAt = 'desc'
    }

    // Pinned threads should always come first
    if (sortBy === 'createdAt') {
      order.isPinned = 'desc'
      order.createdAt = sortOrder
    }

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatar: true,
                  playerName: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: [order],
        skip,
        take: limit,
      }),
      prisma.thread.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        threads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching threads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}

// POST /api/threads - Create a new thread
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const validatedData = createThreadSchema.parse(body)

    // Check if category exists and is active
    const category = await prisma.category.findUnique({
      where: {
        id: validatedData.categoryId,
        isActive: true,
      },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found or inactive' },
        { status: 404 }
      )
    }

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingThread = await prisma.thread.findUnique({
      where: { slug },
    })

    if (existingThread) {
      // Add random suffix to make slug unique
      const uniqueSlug = `${slug}-${Date.now()}`
      validatedData.slug = uniqueSlug
    } else {
      validatedData.slug = slug
    }

    const thread = await prisma.thread.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug || slug,
        content: validatedData.content,
        categoryId: validatedData.categoryId,
        authorId: user.id,
        tags: validatedData.tagIds ? {
          create: validatedData.tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        } : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                avatar: true,
                playerName: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            slug: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    // Update user's post count
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        totalPosts: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: thread,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating thread:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}