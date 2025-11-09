import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'

export type Role = 'USER' | 'MODERATOR' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: Role
  profile?: any
}

/**
 * Get the current authenticated user from the session
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

/**
 * Require authentication - redirects to sign in if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

/**
 * Require specific role - redirects if user doesn't have required role
 */
export async function requireRole(role: Role): Promise<AuthUser> {
  const user = await requireAuth()

  if (role === 'ADMIN' && user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  if (role === 'MODERATOR' && user.role !== 'MODERATOR' && user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return user
}

/**
 * Check if current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

/**
 * Check if current user has moderator role (or admin)
 */
export async function isModerator(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'MODERATOR' || user?.role === 'ADMIN'
}

/**
 * Check if current user can moderate content
 */
export async function canModerate(): Promise<boolean> {
  return await isModerator()
}

/**
 * Check if current user can edit a specific post/thread
 */
export async function canEditContent(authorId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Users can edit their own content
  if (user.id === authorId) return true

  // Moderators and admins can edit any content
  return await canModerate()
}

/**
 * Check if current user can delete content
 */
export async function canDeleteContent(authorId: string): Promise<boolean> {
  return await canEditContent(authorId)
}

/**
 * Check if current user can ban users
 */
export async function canBanUsers(): Promise<boolean> {
  return await isModerator()
}

/**
 * Check if current user can manage categories
 */
export async function canManageCategories(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

/**
 * Check if current user can view admin panel
 */
export async function canViewAdminPanel(): Promise<boolean> {
  return await isAdmin()
}

/**
 * Check if current user can view moderator panel
 */
export async function canViewModeratorPanel(): Promise<boolean> {
  return await isModerator()
}

/**
 * Get role-based permissions object
 */
export async function getRolePermissions() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      canCreateThreads: false,
      canCreatePosts: false,
      canEditOwnContent: false,
      canEditAnyContent: false,
      canDeleteOwnContent: false,
      canDeleteAnyContent: false,
      canModerate: false,
      canBanUsers: false,
      canManageCategories: false,
      canViewAdminPanel: false,
      canViewModeratorPanel: false,
    }
  }

  const isAdminUser = user.role === 'ADMIN'
  const isModeratorUser = user.role === 'MODERATOR' || isAdminUser

  return {
    canCreateThreads: true,
    canCreatePosts: true,
    canEditOwnContent: true,
    canEditAnyContent: isModeratorUser,
    canDeleteOwnContent: true,
    canDeleteAnyContent: isModeratorUser,
    canModerate: isModeratorUser,
    canBanUsers: isModeratorUser,
    canManageCategories: isAdminUser,
    canViewAdminPanel: isAdminUser,
    canViewModeratorPanel: isModeratorUser,
  }
}