import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Lock,
  Building2,
  Video,
  Lightbulb,
} from 'lucide-react'

import PageLoader from 'src/components/page-loader'
import ZoomDialog from 'src/components/zoom-dialog'
import ParticipantPreCheckinPage from 'src/components/participant-pre-checkin-page'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Skeleton,
} from '@repo/react-components/ui'
import api from 'src/lib/api'
import { BOOTH_THRESHOLD } from 'src/lib/constants'
import type { User, BoothCheckin } from 'src/types/schema'

export const Route = createFileRoute('/participant/')({
  component: ParticipantIndexPage,
  pendingComponent: PageLoader,
})

// Skeleton Loading Component
function ParticipantIndexSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome & Progress Section Skeleton - Combined */}
      <Card>
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Navigation Menu Skeleton */}
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center space-y-3">
                <Skeleton className="size-12 sm:size-14 rounded-full" />
                <Skeleton className="h-4 sm:h-5 w-16" />
                <Skeleton className="h-3 w-24 sm:w-32" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center space-y-3">
                <Skeleton className="size-12 sm:size-14 rounded-full" />
                <Skeleton className="h-4 sm:h-5 w-20" />
                <Skeleton className="h-3 w-20 sm:w-28" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voucher Section Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4">
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ParticipantIndexPage() {
  const queryClient = useQueryClient()

  // State for zoom dialog
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false)

  // Fetch current user
  const { data: user, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.getCurrentUser(),
  })

  // Fetch booth checkins for current user (only if checked in)
  const { data: boothCheckins = [], isLoading: isLoadingCheckins } = useQuery<BoothCheckin[]>({
    queryKey: ['boothCheckins', user?.id],
    queryFn: () => api.checkins.getParticipantBoothCheckins(user!.id),
    enabled: !!user?.id && user.is_checked_in === true,
  })

  // Subscribe to realtime user changes (for QR check-in and eligibility updates)
  // with Page Visibility API to save WebSocket connections
  useEffect(() => {
    if (
      !user?.id || 
      user?.participant_type === 'online' ||
      (user?.participant_type === 'offline' && user?.is_checked_in)
    ) {
      return
    }

    let unsubscribe: (() => void) | null = null

    const setupSubscription = () => {
      console.log('[ParticipantIndex] Subscribing to user changes for:', user.id)

      unsubscribe = api.users.subscribeToUserChanges(user.id, (updatedUser) => {
        console.log('[ParticipantIndex] User changed:', updatedUser)

        // Invalidate current user query to refetch updated data
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })

        // If user just got checked in, also invalidate booth checkins query
        if (updatedUser.is_checked_in && !user.is_checked_in) {
          console.log('[ParticipantIndex] User just checked in, invalidating booth checkins')
          queryClient.invalidateQueries({ queryKey: ['boothCheckins', user.id] })
        }
      })
    }

    const teardownSubscription = () => {
      if (unsubscribe) {
        console.log('[ParticipantIndex] Unsubscribing from user changes for:', user.id)
        unsubscribe()
        unsubscribe = null
      }
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[ParticipantIndex] Page hidden, unsubscribing to save connection')
        teardownSubscription()
      } else {
        console.log('[ParticipantIndex] Page visible, resubscribing')
        setupSubscription()
        // Refetch data when page becomes visible again to get latest state
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
        if (user.is_checked_in) {
          queryClient.invalidateQueries({ queryKey: ['boothCheckins', user.id] })
        }
      }
    }

    // Initial subscription (only if page is visible)
    if (!document.hidden) {
      setupSubscription()
    }

    // Listen to visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      teardownSubscription()
    }
  }, [user?.id, user?.is_checked_in, user?.participant_type, queryClient])

  const isLoading = isLoadingUser || (user?.is_checked_in && isLoadingCheckins)

  // Show skeleton while loading
  if (isLoading || !user) {
    return <ParticipantIndexSkeleton />
  }

  // PRE CHECK-IN STATE: Show pre-checkin page component
  if (!user.is_checked_in) {
    return <ParticipantPreCheckinPage user={user} />
  }

  // POST CHECK-IN STATE: Show full participant dashboard
  // Calculate progress
  const boothsCompleted = boothCheckins.length
  const totalBooths = user.participant_type === 'offline'
    ? BOOTH_THRESHOLD.offline
    : BOOTH_THRESHOLD.online
  const progressPercentage = (boothsCompleted / totalBooths) * 100
  const remainingBooths = totalBooths - boothsCompleted
  const isEligible = user.is_eligible_to_draw ?? false

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome & Progress Section - Combined */}
      <Card>
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl">
              Selamat Datang, {user.name}!
            </CardTitle>
            <Badge variant={user.participant_type === 'offline' ? 'default' : 'secondary'}>
              {user.participant_type === 'offline' ? 'Offline' : 'Online'}
            </Badge>
          </div>
          <CardDescription>
            Terima kasih telah mengikuti Expert Forum 2025
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Progress Booth: {boothsCompleted} dari {totalBooths}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Status Message */}
          {!isEligible && (
            <div className="rounded-lg bg-muted p-3 sm:p-4">
              <p className="text-sm text-muted-foreground">
                Selesaikan <span className="font-semibold text-foreground">{remainingBooths} booth lagi</span> untuk mendapatkan voucher dan mengikuti undian
              </p>
            </div>
          )}

          {isEligible && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 sm:p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Selamat! Anda telah menyelesaikan semua booth
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <div className="space-y-3 sm:space-y-4">
        {/* First Row: Booth and Collaboration */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Booth Card */}
          <Link to="/participant/booth" className="block">
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="rounded-full bg-primary/10 p-3 sm:p-4">
                    <Building2 className="size-5 sm:size-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm sm:text-base">Booth</h3>
                    <p className="text-xs text-muted-foreground">
                      Kunjungi booth perusahaan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Collaboration Card */}
          <Link to="/participant/collaboration" className="block">
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="rounded-full bg-primary/10 p-3 sm:p-4">
                    <Lightbulb className="size-5 sm:size-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm sm:text-base">Collaboration</h3>
                    <p className="text-xs text-muted-foreground">
                      {user.participant_type === 'offline' ? 'Buat grup ideasi' : 'Submit ideasi'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Second Row: Zoom Card - Only for online participants */}
        {user.participant_type === 'online' && (
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setIsZoomDialogOpen(true)}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="rounded-full bg-primary/10 p-3 sm:p-4">
                  <Video className="size-5 sm:size-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm sm:text-base">Join Zoom Meeting</h3>
                  <p className="text-xs text-muted-foreground">
                    Bergabung dengan sesi virtual
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Voucher Section - Moved to bottom */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Voucher & Undian</CardTitle>
        </CardHeader>
        <CardContent>
          {!isEligible ? (
            // Locked State
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center space-y-4">
              <div className="rounded-full bg-muted p-4 sm:p-6">
                <Lock className="size-8 sm:size-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-base sm:text-lg">Voucher Terkunci</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Selesaikan {remainingBooths} booth lagi untuk membuka voucher dan mendapatkan kesempatan mengikuti undian berhadiah
                </p>
              </div>
            </div>
          ) : (
            // Unlocked State
            <div className="space-y-4">
              {/* Voucher Image Placeholder */}
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="size-12 sm:size-16 text-primary mx-auto" />
                    <p className="font-semibold text-lg sm:text-xl">Voucher Unlocked!</p>
                    <p className="text-sm text-muted-foreground">Kode: ASTRA2025</p>
                  </div>
                </div>
              </div>

              {/* Eligibility Badge */}
              <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Anda Memenuhi Syarat!</p>
                    <p className="text-sm text-muted-foreground">
                      Selamat! Anda telah memenuhi syarat untuk mengikuti undian berhadiah Expert Forum 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zoom Dialog - Dialog for desktop, Bottom Sheet for mobile */}
      <ZoomDialog
        open={isZoomDialogOpen}
        onOpenChange={setIsZoomDialogOpen}
        user={user}
      />
    </div>
  )
}

export default ParticipantIndexPage
