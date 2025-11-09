import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/health - Health check and API documentation
export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      apis: {
        authentication: {
          base: '/api/auth/[...nextauth]',
          methods: ['GET', 'POST'],
          description: 'NextAuth.js authentication endpoints',
        },
        categories: {
          base: '/api/categories',
          endpoints: [
            {
              method: 'GET',
              path: '/api/categories',
              description: 'Get all categories',
              params: {
                includeChildren: 'boolean - Include child categories',
                parentId: 'string - Filter by parent category',
              },
            },
            {
              method: 'POST',
              path: '/api/categories',
              description: 'Create new category (admin only)',
              body: {
                name: 'string (required)',
                description: 'string (optional)',
                color: 'string (optional, hex color)',
                icon: 'string (optional)',
                parentId: 'string (optional)',
                position: 'number (optional)',
              },
            },
            {
              method: 'GET',
              path: '/api/categories/[id]',
              description: 'Get specific category',
            },
            {
              method: 'PUT',
              path: '/api/categories/[id]',
              description: 'Update category (admin only)',
            },
            {
              method: 'DELETE',
              path: '/api/categories/[id]',
              description: 'Delete category (admin only)',
            },
          ],
        },
        threads: {
          base: '/api/threads',
          endpoints: [
            {
              method: 'GET',
              path: '/api/threads',
              description: 'Get threads with pagination',
              params: {
                page: 'number - Page number',
                limit: 'number - Items per page',
                categoryId: 'string - Filter by category',
                authorId: 'string - Filter by author',
                isPinned: 'boolean - Filter pinned threads',
                search: 'string - Search query',
                sortBy: 'string - Sort field (createdAt, updatedAt, views)',
                sortOrder: 'string - Sort order (asc, desc)',
              },
            },
            {
              method: 'POST',
              path: '/api/threads',
              description: 'Create new thread',
              body: {
                title: 'string (required)',
                content: 'string (required)',
                categoryId: 'string (required)',
                tagIds: 'array - Tag IDs (optional)',
              },
            },
            {
              method: 'GET',
              path: '/api/threads/[id]',
              description: 'Get specific thread with posts',
            },
            {
              method: 'PUT',
              path: '/api/threads/[id]',
              description: 'Update thread',
            },
            {
              method: 'DELETE',
              path: '/api/threads/[id]',
              description: 'Delete thread',
            },
          ],
        },
        posts: {
          base: '/api/posts',
          endpoints: [
            {
              method: 'GET',
              path: '/api/posts',
              description: 'Get posts with pagination',
              params: {
                page: 'number - Page number',
                limit: 'number - Items per page',
                threadId: 'string - Filter by thread',
                authorId: 'string - Filter by author',
                parentId: 'string - Filter by parent post',
              },
            },
            {
              method: 'POST',
              path: '/api/posts',
              description: 'Create new post',
              body: {
                content: 'string (required)',
                threadId: 'string (required)',
                parentId: 'string - Parent post ID (optional)',
              },
            },
            {
              method: 'GET',
              path: '/api/posts/[id]',
              description: 'Get specific post',
            },
            {
              method: 'PUT',
              path: '/api/posts/[id]',
              description: 'Update post',
            },
            {
              method: 'DELETE',
              path: '/api/posts/[id]',
              description: 'Delete post',
            },
            {
              method: 'POST',
              path: '/api/posts/[id]/vote',
              description: 'Vote on post',
              body: {
                type: 'string - UP or DOWN',
              },
            },
            {
              method: 'GET',
              path: '/api/posts/[id]/vote',
              description: 'Get user vote on post',
            },
          ],
        },
        tags: {
          base: '/api/tags',
          endpoints: [
            {
              method: 'GET',
              path: '/api/tags',
              description: 'Get all tags',
              params: {
                search: 'string - Search tags',
                limit: 'number - Max results',
              },
            },
            {
              method: 'POST',
              path: '/api/tags',
              description: 'Create new tag (moderator+)',
              body: {
                name: 'string (required)',
                color: 'string (optional, hex color)',
              },
            },
          ],
        },
        users: {
          base: '/api/users',
          endpoints: [
            {
              method: 'GET',
              path: '/api/users/[id]',
              description: 'Get user profile',
              params: {
                includeStats: 'boolean - Include threads and posts',
              },
            },
            {
              method: 'PUT',
              path: '/api/users/[id]',
              description: 'Update user profile',
              body: {
                bio: 'string',
                avatar: 'string - URL',
                signature: 'string',
                location: 'string',
                website: 'string - URL',
                discord: 'string',
                steam: 'string',
                playerName: 'string',
              },
            },
          ],
        },
        search: {
          base: '/api/search',
          endpoints: [
            {
              method: 'GET',
              path: '/api/search',
              description: 'Search forum content',
              params: {
                query: 'string (required) - Search query',
                type: 'string - threads, posts, users, or all',
                page: 'number - Page number',
                limit: 'number - Items per page',
                categoryId: 'string - Filter by category',
              },
            },
          ],
        },
        stats: {
          base: '/api/stats',
          endpoints: [
            {
              method: 'GET',
              path: '/api/stats',
              description: 'Get forum statistics',
              params: {
                detailed: 'boolean - Include detailed statistics',
              },
            },
          ],
        },
        health: {
          base: '/api/health',
          endpoints: [
            {
              method: 'GET',
              path: '/api/health',
              description: 'Health check and API documentation',
            },
          ],
        },
      },
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
      { status: 503 }
    )
  }
}