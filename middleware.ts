import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isModerator = token?.role === 'MODERATOR' || isAdmin
    const isAuthenticated = !!token

    const { pathname } = req.nextUrl

    // Public routes
    const publicRoutes = [
      '/',
      '/auth/signin',
      '/auth/signup',
      '/auth/error',
      '/forums',
      '/threads/[threadId]',
      '/users/[userId]',
      '/api/health',
    ]

    // Admin only routes
    const adminRoutes = [
      '/admin',
      '/admin/users',
      '/admin/categories',
      '/admin/reports',
      '/admin/settings',
    ]

    // Moderator routes
    const moderatorRoutes = [
      '/moderator',
      '/moderator/reports',
      '/moderator/users',
    ]

    // Authenticated routes
    const authRoutes = [
      '/dashboard',
      '/profile',
      '/create-thread',
      '/edit-thread',
      '/edit-post',
    ]

    // Check if route is public
    if (publicRoutes.some(route => {
      if (route.includes('[') && route.includes(']')) {
        // Handle dynamic routes
        const routePattern = route.replace(/\[.*?\]/g, '[^/]+')
        const regex = new RegExp(`^${routePattern}$`)
        return regex.test(pathname)
      }
      return pathname === route
    })) {
      return NextResponse.next()
    }

    // Check if admin route
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        const url = new URL('/auth/signin', req.url)
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Check if moderator route
    if (moderatorRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        const url = new URL('/auth/signin', req.url)
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
      }
      if (!isModerator) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Check if authenticated route
    if (authRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        const url = new URL('/auth/signin', req.url)
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}