import { redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { AuthContextType } from 'src/contexts/auth'
import type { User, Event } from 'src/types/schema'
import api from 'src/lib/api'
import whitelistedParticipants from 'src/lib/whitelisted-test-user'

// Helper function to generate mock event for whitelisted users
function getMockEventForWhitelistedUser(realEvent: Event): Event {
  const today = new Date()
  today.setHours(8, 0, 0, 0) // Set to 8 AM today

  return {
    ...realEvent,
    is_active: true,
    event_dates: today.toISOString(),
  }
}

// Helper function to check if user is whitelisted
function isUserWhitelisted(email: string | undefined): boolean {
  if (!email) return false
  return whitelistedParticipants.includes(email)
}

/**
 * Route guard to ensure user is authenticated
 * Returns the authenticated user or redirects to home
 */
export async function requireAuth(
  auth: AuthContextType | undefined,
  currentPath?: string,
  searchParams?: Record<string, unknown>
): Promise<User> {
  // Call initAuth which will:
  // 1. Return cached user if already initialized
  // 2. Reuse in-flight promise if initialization is in progress
  // 3. Only fetch once if not initialized
  const user = await auth?.initAuth()

  if (!user) {
    // Build redirect URL with current path and search params
    const params = new URLSearchParams()

    if (currentPath) {
      params.set('redirect', currentPath)

      // Add search params to redirect URL
      if (searchParams && Object.keys(searchParams).length > 0) {
        const searchString = new URLSearchParams(
          searchParams as Record<string, string>
        ).toString()
        params.set('search', searchString)
      }
    }

    throw redirect({
      to: '/',
      search: Object.fromEntries(params.entries())
    })
  }

  return user
}

/**
 * Route guard to ensure user has specific role
 * Returns the authenticated user with correct role or redirects to home
 */
export async function requireRole(
  auth: AuthContextType | undefined,
  allowedRoles: User['role'][],
  currentPath?: string,
  searchParams?: Record<string, unknown>
): Promise<User> {
  const user = await requireAuth(auth, currentPath, searchParams)

  if (!allowedRoles.includes(user.role)) {
    throw redirect({ to: '/' })
  }

  return user
}

/**
 * Convenience guards for specific roles
 */
export const requireParticipant = (
  auth: AuthContextType | undefined,
  currentPath?: string,
  searchParams?: Record<string, unknown>
) => requireRole(auth, ['participant'], currentPath, searchParams)

export const requireStaff = (
  auth: AuthContextType | undefined,
  currentPath?: string,
  searchParams?: Record<string, unknown>
) => requireRole(auth, ['staff'], currentPath, searchParams)

export const requireAdmin = (
  auth: AuthContextType | undefined,
  currentPath?: string,
  searchParams?: Record<string, unknown>
) => requireRole(auth, ['admin'], currentPath, searchParams)

export const requireStaffOrAdmin = (
  auth: AuthContextType | undefined,
  currentPath?: string,
  searchParams?: Record<string, unknown>
) => requireRole(auth, ['staff', 'admin'], currentPath, searchParams)

/**
 * Helper function to get redirect URL based on user role
 * If there's a redirect param, validate it matches the user's role
 * For participants, also check if they are checked in
 * Otherwise, return default route for the role
 */
export function getRedirectUrl(
  user: User,
  redirectParam?: string,
  searchParam?: string
): { to: string; search?: Record<string, unknown> } {
  const { role, is_checked_in } = user
  // Check if there's a redirect URL from route guard
  if (redirectParam) {
    // Validate redirect path matches user role
    // For participants, also validate they are checked in
    if (
      (role === 'admin' && redirectParam.startsWith('/admin')) ||
      (role === 'staff' && redirectParam.startsWith('/staff')) ||
      (role === 'participant' && redirectParam.startsWith('/participant') && is_checked_in)
    ) {
      // Redirect to requested path if it matches user role (and checked in for participants)
      return {
        to: redirectParam,
        search: searchParam
          ? Object.fromEntries(new URLSearchParams(searchParam).entries())
          : undefined
      }
    }
  }

  // Default redirect based on role
  if (role === 'admin') {
    return { to: '/admin' }
  } else if (role === 'staff') {
    return { to: '/staff' }
  } else if (role === 'participant') {
    return { to: '/participant' }
  }

  return { to: '/' }
}

/**
 * Route guard to ensure participant can access sub-routes
 * Checks: 1) user is checked in, 2) event is active
 * If either condition fails, redirects to main participant page
 * Allows access to /participant but blocks /participant/booth, /participant/collaboration, etc.
 * Uses React Query cache to avoid duplicate API calls
 */
export async function requireActiveEventAndCheckedIn(
  queryClient: QueryClient,
  user: User,
  currentPath: string
): Promise<void> {
  // Allow access to main participant page
  if (currentPath === '/participant' || currentPath === '/participant/') {
    return
  }

  // Check if user is checked in
  if (!user.is_checked_in) {
    throw redirect({ to: '/participant' })
  }

  // Fetch event using React Query - will use cache if available
  const event = await queryClient.fetchQuery<Event>({
    queryKey: ['event'],
    queryFn: async () => {
      const realEvent = await api.events.getEvent()
      // Mock event for whitelisted test users
      if (isUserWhitelisted(user.email)) {
        return getMockEventForWhitelistedUser(realEvent)
      }
      return realEvent
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - won't refetch if data is fresh
  })

  // Check if event is active
  if (!event?.is_active) {
    throw redirect({ to: '/participant' })
  }
}
