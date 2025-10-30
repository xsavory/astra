import { redirect } from '@tanstack/react-router'
import type { AuthContextType } from 'src/contexts/auth'
import type { User } from 'src/types/schema'

/**
 * Route guard to ensure user is authenticated
 * Returns the authenticated user or redirects to home
 */
export async function requireAuth(
  auth: AuthContextType | undefined
): Promise<User> {
  // Call initAuth which will:
  // 1. Return cached user if already initialized
  // 2. Reuse in-flight promise if initialization is in progress
  // 3. Only fetch once if not initialized
  const user = await auth?.initAuth()

  if (!user) {
    throw redirect({ to: '/' })
  }

  return user
}

/**
 * Route guard to ensure user has specific role
 * Returns the authenticated user with correct role or redirects to home
 */
export async function requireRole(
  auth: AuthContextType | undefined,
  allowedRoles: User['role'][]
): Promise<User> {
  const user = await requireAuth(auth)

  if (!allowedRoles.includes(user.role)) {
    throw redirect({ to: '/' })
  }

  return user
}

/**
 * Convenience guards for specific roles
 */
export const requireParticipant = (auth: AuthContextType | undefined) =>
  requireRole(auth, ['participant'])

export const requireStaff = (auth: AuthContextType | undefined) =>
  requireRole(auth, ['staff'])

export const requireAdmin = (auth: AuthContextType | undefined) =>
  requireRole(auth, ['admin'])

export const requireStaffOrAdmin = (auth: AuthContextType | undefined) =>
  requireRole(auth, ['staff', 'admin'])
