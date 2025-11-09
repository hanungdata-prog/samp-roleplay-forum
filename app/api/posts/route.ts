import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { z } from 'zod'

// Validation schema for creating posts
const createPostSchema = z.object({
  content: z.string().min(1).max(10000),
  threadId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
})

// GET /api/posts - Get posts with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const threadId = searchParams.get('threadId')
    const authorId = searchParams.get('authorId')
    const parentId = searchParams.get('parentId')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (threadId) {
      where.threadId = threadId
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (parentId === 'null') {
      where.parentId = null
    } else if (parentId) {
      where.parentId = parentId
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
                  signature: true,
                },
              },
            },
          },
          thread: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  slug: true,
                },
              },
            },
          },
          parent: {
            select: {
              id: true,
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          votes: {
            select: {
              type: true,
              userId: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: { position: 'asc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Check if thread exists and is not locked
    const thread = await prisma.thread.findUnique({
      where: { id: validatedData.threadId },
    })

    if (!thread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      )
    }

    if (thread.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Thread is locked' },
        { status: 400 }
      )
    }

    // Check if parent post exists (if provided)
    if (validatedData.parentId) {
      const parentPost = await prisma.post.findUnique({
        where: { id: validatedData.parentId },
      })

      if (!parentPost || parentPost.threadId !== validatedData.threadId) {
        return NextResponse.json(
          { success: false, error: 'Parent post not found or invalid' },
          { status: 404 }
        )
      }
    }

    // Calculate position
    const position = validatedData.parentId
      ? await prisma.post.count({
          where: {
            parentId: validatedData.parentId,
          },
        })
      : await prisma.post.count({
          where: {
            threadId: validatedData.threadId,
            parentId: null,
          },
        })

    const post = await prisma.post.create({
      data: {
        content: validatedData.content,
        threadId: validatedData.threadId,
        authorId: user.id,
        parentId: validatedData.parentId,
        position,
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
                signature: true,
              },
            },
          },
        },
        thread: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                color: true,
                slug: true,
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        votes: {
          select: {
            type: true,
            userId: true,
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
      data: post,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    )
  }
}