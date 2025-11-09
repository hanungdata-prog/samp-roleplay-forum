import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, canEditContent, canDeleteContent } from '@/lib/auth-utils'
import { z } from 'zod'

// Validation schema for updating threads
const updateThreadSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
})

// GET /api/threads/[id] - Get a specific thread
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const thread = await prisma.thread.findUnique({
      where: { id: params.id },
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
        posts: {
          where: { parentId: null }, // Only get main posts, not replies
          orderBy: { position: 'asc' },
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
            votes: {
              select: {
                type: true,
                userId: true,
              },
            },
            replies: {
              orderBy: { position: 'asc' },
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
                votes: {
                  select: {
                    type: true,
                    userId: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    if (!thread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.thread.update({
      where: { id: params.id },
      data: {
        views: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: thread,
    })
  } catch (error) {
    console.error('Error fetching thread:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch thread' },
      { status: 500 }
    )
  }
}

// PUT /api/threads/[id] - Update a thread
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const validatedData = updateThreadSchema.parse(body)

    // Check if thread exists
    const existingThread = await prisma.thread.findUnique({
      where: { id: params.id },
    })

    if (!existingThread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      )
    }

    // Check if user can edit this thread
    if (!(await canEditContent(existingThread.authorId))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to edit this thread' },
        { status: 403 }
      )
    }

    // Update slug if title is provided
    let updateData = { ...validatedData }
    if (validatedData.title) {
      const slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if slug already exists (and it's not the current thread)
      const existingSlug = await prisma.thread.findUnique({
        where: { slug },
      })

      if (existingSlug && existingSlug.id !== params.id) {
        // Add random suffix to make slug unique
        updateData = { ...updateData, slug: `${slug}-${Date.now()}` }
      } else {
        updateData = { ...updateData, slug }
      }
    }

    const thread = await prisma.thread.update({
      where: { id: params.id },
      data: updateData,
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

    console.error('Error updating thread:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update thread' },
      { status: 500 }
    )
  }
}

// DELETE /api/threads/[id] - Delete a thread
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Check if thread exists
    const existingThread = await prisma.thread.findUnique({
      where: { id: params.id },
    })

    if (!existingThread) {
      return NextResponse.json(
        { success: false, error: 'Thread not found' },
        { status: 404 }
      )
    }

    // Check if user can delete this thread
    if (!(await canDeleteContent(existingThread.authorId))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this thread' },
        { status: 403 }
      )
    }

    await prisma.thread.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Thread deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting thread:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete thread' },
      { status: 500 }
    )
  }
}