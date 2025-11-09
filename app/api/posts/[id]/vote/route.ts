import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'
import { z } from 'zod'

// Validation schema for voting
const voteSchema = z.object({
  type: z.enum(['UP', 'DOWN']),
})

// POST /api/posts/[id]/vote - Vote on a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { type } = voteSchema.parse(body)

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
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

    // Prevent voting on own posts
    if (post.authorId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot vote on your own post' },
        { status: 400 }
      )
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        postId_userId: {
          postId: params.id,
          userId: user.id,
        },
      },
    })

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type
        await prisma.vote.delete({
          where: { id: existingVote.id },
        })

        // Update author's like count
        await prisma.profile.update({
          where: { userId: post.authorId },
          data: {
            totalLikes: {
              decrement: 1,
            },
          },
        })

        return NextResponse.json({
          success: true,
          data: { voted: false, type: null },
        })
      } else {
        // Update vote type
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        })

        return NextResponse.json({
          success: true,
          data: { voted: true, type },
        })
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          postId: params.id,
          userId: user.id,
          type,
        },
      })

      // Update author's like count
      await prisma.profile.update({
        where: { userId: post.authorId },
        data: {
          totalLikes: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: { voted: true, type },
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error voting on post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to vote on post' },
      { status: 500 }
    )
  }
}

// GET /api/posts/[id]/vote - Get user's vote on a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const vote = await prisma.vote.findUnique({
      where: {
        postId_userId: {
          postId: params.id,
          userId: user.id,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        voted: !!vote,
        type: vote?.type || null,
      },
    })
  } catch (error) {
    console.error('Error fetching vote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vote' },
      { status: 500 }
    )
  }
}