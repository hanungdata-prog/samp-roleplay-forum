import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, canEditContent, canDeleteContent } from '@/lib/auth-utils'
import { z } from 'zod'

// Validation schema for updating posts
const updatePostSchema = z.object({
  content: z.string().min(1).max(10000),
})

// GET /api/posts/[id] - Get a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
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
            isLocked: true,
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
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: post,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        thread: {
          select: {
            isLocked: true,
          },
        },
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if thread is locked
    if (existingPost.thread.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Cannot edit post in locked thread' },
        { status: 400 }
      )
    }

    // Check if user can edit this post
    if (!(await canEditContent(existingPost.authorId))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to edit this post' },
        { status: 403 }
      )
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: validatedData,
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

    console.error('Error updating post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        thread: {
          select: {
            isLocked: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if thread is locked
    if (existingPost.thread.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete post in locked thread' },
        { status: 400 }
      )
    }

    // Prevent deletion if post has replies (unless moderator/admin)
    if (existingPost._count.replies > 0) {
      const canModerate = await canEditContent(existingPost.authorId)
      if (!canModerate) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete post with replies' },
          { status: 400 }
        )
      }
    }

    // Check if user can delete this post
    if (!(await canDeleteContent(existingPost.authorId))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this post' },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}