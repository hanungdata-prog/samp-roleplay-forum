import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for search
const searchSchema = z.object({
  query: z.string().min(1).max(100),
  type: z.enum(['threads', 'posts', 'users', 'all']).default('all'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  categoryId: z.string().uuid().optional(),
})

// GET /api/search - Search the forum
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const validatedData = searchSchema.parse({
      query: searchParams.get('query'),
      type: searchParams.get('type') || 'all',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      categoryId: searchParams.get('categoryId') || undefined,
    })

    const { query, type, page, limit, categoryId } = validatedData
    const skip = (page - 1) * limit

    const results: any = {
      threads: [],
      posts: [],
      users: [],
      total: {
        threads: 0,
        posts: 0,
        users: 0,
      },
    }

    const searchConditions = {
      query: {
        contains: query,
        mode: 'insensitive' as const,
      },
      ...(categoryId && {
        category: {
          id: categoryId,
        },
      }),
    }

    // Search threads
    if (type === 'threads' || type === 'all') {
      const [threads, threadsTotal] = await Promise.all([
        prisma.thread.findMany({
          where: {
            OR: [
              { title: searchConditions.query },
              { content: searchConditions.query },
            ],
            ...(categoryId && [{ categoryId }]),
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
            _count: {
              select: {
                posts: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.thread.count({
          where: {
            OR: [
              { title: searchConditions.query },
              { content: searchConditions.query },
            ],
            ...(categoryId && [{ categoryId }]),
          },
        }),
      ])

      results.threads = threads
      results.total.threads = threadsTotal
    }

    // Search posts
    if (type === 'posts' || type === 'all') {
      const postSkip = type === 'posts' ? skip : 0
      const postLimit = type === 'posts' ? limit : 5

      const [posts, postsTotal] = await Promise.all([
        prisma.post.findMany({
          where: {
            content: searchConditions.query,
            ...(categoryId && {
              thread: {
                categoryId,
              },
            }),
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
          },
          orderBy: { createdAt: 'desc' },
          skip: postSkip,
          take: postLimit,
        }),
        prisma.post.count({
          where: {
            content: searchConditions.query,
            ...(categoryId && {
              thread: {
                categoryId,
              },
            }),
          },
        }),
      ])

      results.posts = posts
      results.total.posts = postsTotal
    }

    // Search users
    if (type === 'users' || type === 'all') {
      const userSkip = type === 'users' ? skip : 0
      const userLimit = type === 'users' ? limit : 5

      const [users, usersTotal] = await Promise.all([
        prisma.user.findMany({
          where: {
            isActive: true,
            OR: [
              { name: searchConditions.query },
              { email: searchConditions.query },
              {
                profile: {
                  playerName: searchConditions.query,
                },
              },
            ],
          },
          select: {
            id: true,
            name: true,
            role: true,
            createdAt: true,
            lastLoginAt: true,
            profile: {
              select: {
                avatar: true,
                playerName: true,
                bio: true,
                totalPosts: true,
                totalLikes: true,
                reputation: true,
                location: true,
              },
            },
            _count: {
              select: {
                threads: true,
                posts: true,
              },
            },
          },
          orderBy: {
            lastLoginAt: 'desc',
          },
          skip: userSkip,
          take: userLimit,
        }),
        prisma.user.count({
          where: {
            isActive: true,
            OR: [
              { name: searchConditions.query },
              { email: searchConditions.query },
              {
                profile: {
                  playerName: searchConditions.query,
                },
              },
            ],
          },
        }),
      ])

      results.users = users
      results.total.users = usersTotal
    }

    // Calculate pagination for the specific type
    const getPagination = (total: number) => ({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    })

    const pagination = type === 'all'
      ? {
          threads: getPagination(results.total.threads),
          posts: getPagination(results.total.posts),
          users: getPagination(results.total.users),
        }
      : getPagination(results.total[type as keyof typeof results.total])

    return NextResponse.json({
      success: true,
      data: {
        ...results,
        pagination,
        query,
        type,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error searching:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search' },
      { status: 500 }
    )
  }
}