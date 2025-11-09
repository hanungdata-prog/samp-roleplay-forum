import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stats - Get forum statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

    const [
      totalUsers,
      totalThreads,
      totalPosts,
      totalCategories,
      totalTags,
      onlineUsers,
      recentActivity,
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { isActive: true },
      }),
      // Total threads
      prisma.thread.count(),
      // Total posts
      prisma.post.count(),
      // Total categories
      prisma.category.count({
        where: { isActive: true },
      }),
      // Total tags
      prisma.tag.count(),
      // Online users (logged in in last 15 minutes)
      prisma.user.count({
        where: {
          isActive: true,
          lastLoginAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000),
          },
        },
      }),
      // Recent activity (last 24 hours)
      prisma.post.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    const baseStats = {
      totalUsers,
      totalThreads,
      totalPosts,
      totalCategories,
      totalTags,
      onlineUsers,
      recentActivity,
    }

    if (!detailed) {
      return NextResponse.json({
        success: true,
        data: baseStats,
      })
    }

    // Get detailed statistics
    const [
      topUsers,
      topThreads,
      categoryStats,
      factionStats,
      monthlyStats,
    ] = await Promise.all([
      // Top users by posts
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              totalPosts: true,
              totalLikes: true,
              reputation: true,
              avatar: true,
              playerName: true,
            },
          },
        },
        orderBy: {
          profile: {
            totalPosts: 'desc',
          },
        },
        take: 10,
      }),
      // Top threads by views
      prisma.thread.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
            },
          },
          author: {
            select: {
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
              name: true,
              color: true,
              slug: true,
            },
          },
        },
        orderBy: { views: 'desc' },
        take: 10,
      }),
      // Category statistics
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          color: true,
          slug: true,
          _count: {
            select: {
              threads: true,
            },
          },
        },
        orderBy: {
          _count: {
            threads: 'desc',
          },
        },
      }),
      // Faction statistics
      prisma.faction.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          logo: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          _count: {
            members: 'desc',
          },
        },
      }),
      // Monthly activity (last 6 months)
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', createdAt) as month,
          COUNT(*) as posts
        FROM Post
        WHERE createdAt >= date('now', '-6 months')
        GROUP BY DATE_TRUNC('month', createdAt)
        ORDER BY month ASC
      `,
    ])

    const detailedStats = {
      ...baseStats,
      topUsers,
      topThreads,
      categoryStats,
      factionStats,
      monthlyStats,
    }

    return NextResponse.json({
      success: true,
      data: detailedStats,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}