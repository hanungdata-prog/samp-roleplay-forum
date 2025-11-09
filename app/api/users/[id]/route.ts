import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, canModerate } from '@/lib/auth-utils'
import { z } from 'zod'

// Validation schema for updating profile
const updateProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  avatar: z.string().url().optional(),
  signature: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  discord: z.string().max(50).optional(),
  steam: z.string().max(50).optional(),
  playerName: z.string().max(50).optional(),
})

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: includeStats, // Only include email for stats view
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        profile: {
          select: {
            bio: true,
            avatar: true,
            signature: true,
            location: true,
            website: true,
            discord: true,
            steam: true,
            playerName: true,
            playerLevel: true,
            playerMoney: true,
            factionId: true,
            totalPosts: true,
            totalLikes: true,
            reputation: true,
            joinDate: true,
          },
        },
        ...(includeStats && {
          threads: {
            select: {
              id: true,
              title: true,
              slug: true,
              createdAt: true,
              views: true,
              _count: {
                select: {
                  posts: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          },
          posts: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              thread: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          _count: {
            select: {
              threads: true,
              posts: true,
            },
          },
        }),
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Users can only update their own profile, moderators can update any
    if (user.id !== params.id && !(await canModerate())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: params.id },
      update: validatedData,
      create: {
        userId: params.id,
        ...validatedData,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}