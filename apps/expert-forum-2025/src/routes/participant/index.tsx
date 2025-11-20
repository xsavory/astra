import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Lock,
  Building2,
  Video,
  Lightbulb,
  Award,
  FileText,
} from 'lucide-react'

import PageLoader from 'src/components/page-loader'
import ZoomDialog from 'src/components/zoom-dialog'
import BoothVotingDialog from 'src/components/booth-voting-dialog'
import WallOfExpertDialog from 'src/components/wall-of-expert-dialog'
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
import type { User, BoothCheckin, Event } from 'src/types/schema'

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
        {/* Additional row skeleton for voting card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center space-y-3">
              <Skeleton className="size-12 sm:size-14 rounded-full" />
              <Skeleton className="h-4 sm:h-5 w-24" />
              <Skeleton className="h-3 w-32 sm:w-40" />
            </div>
          </CardContent>
        </Card>
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
  // State for voting dialog
  const [isVotingDialogOpen, setIsVotingDialogOpen] = useState(false)
  // State for wall of expert dialog
  const [isWallOfExpertDialogOpen, setIsWallOfExpertDialogOpen] = useState(false)

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

  // Fetch event data to check if event is active
  // Uses same query key as route guard - will use cached data
  const { data: event, isLoading: loadingEvent } = useQuery<Event>({
    queryKey: ['event'],
    queryFn: () => api.events.getEvent(),
    staleTime: 1000 * 60 * 5, // 5 minutes - match route guard staleTime
  })

  // Subscribe to realtime user changes (for QR check-in and eligibility updates)
  // with Page Visibility API to save WebSocket connections
  useEffect(() => {
    // Early returns to prevent unnecessary subscriptions
    if (!user?.id) return
    if (!event?.is_active) return
    if (user.participant_type === 'online') return
    if (user.participant_type === 'offline' && user.is_checked_in) return

    let unsubscribe: (() => void) | null = null

    const setupSubscription = () => {

      unsubscribe = api.users.subscribeToUserChanges(user.id, (updatedUser) => {
        // Invalidate current user query to refetch updated data
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })

        // If user just got checked in, also invalidate booth checkins query
        if (updatedUser.is_checked_in && !user.is_checked_in) {
          queryClient.invalidateQueries({ queryKey: ['boothCheckins', user.id] })
        }
      })
    }

    const teardownSubscription = () => {
      if (unsubscribe) {
        unsubscribe()
        unsubscribe = null
      }
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        teardownSubscription()
      } else {
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
  }, [user?.id, user?.is_checked_in, user?.participant_type, event?.is_active, queryClient])

  const isLoading = isLoadingUser || (user?.is_checked_in && isLoadingCheckins)

  // Show skeleton while loading
  if (isLoading || loadingEvent || !user) {
    return <ParticipantIndexSkeleton />
  }

  // PRE CHECK-IN STATE: Show pre-checkin page component
  if (!user.is_checked_in) {
    return <ParticipantPreCheckinPage user={user} event={event} />
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
    <div className="space-y-4 sm:space-y-6 relative">
      {/* Welcome & Progress Section - Combined */}
      <Card className="relative overflow-hidden border-2 border-primary/30 shadow-xl shadow-primary/20">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />

        <CardHeader className="relative space-y-1 pb-4">
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
            <Badge variant='outline'>{user.company}</Badge>
            <Badge
              variant={user.participant_type === 'offline' ? 'default' : 'secondary'}
              className="shadow-lg">
              {user.participant_type === 'offline' ? 'Offline' : 'Online'}
            </Badge>
            </div>
            <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent font-bold">
              Welcome, {user.name}!
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Thank you for joining Expert Forum 2025.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2 rounded bg-gradient-to-br from-primary/10 to-cyan-500/5 p-4 border border-primary/20">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                Booth Progress: {boothsCompleted} of {totalBooths}
              </span>
              <span className="font-bold text-primary">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Status Message */}
          {!isEligible && (
            <div className="rounded bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-2 border-2 border-amber-500/30 shadow-lg shadow-amber-500/10">
              <p className="text-xs font-medium">
                Complete <span className="font-bold text-amber-600 dark:text-amber-400">{remainingBooths} more booth{remainingBooths > 1 ? 's' : ''}</span> to get a voucher and participate in the lucky draw
              </p>
            </div>
          )}

          {isEligible && (
            <div className="rounded-xl bg-gradient-to-br from-green-500/15 to-emerald-500/10 p-4 border-2 border-green-500/40 shadow-lg shadow-green-500/20">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0" />
                </div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Congratulations! You have completed all booths
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
          <Link to="/participant/booth" className="block group">
            <Card className="cursor-pointer h-full bg-gradient-to-r from-primary via-blue-600 to-cyan-500 border-2 border-white/30 shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="rounded-full bg-white/20 backdrop-blur-sm p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="size-5 sm:size-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white">Booth Checkin</h3>
                    <p className="text-xs text-white/80">
                      Visit booths
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Collaboration Card */}
          <Link to="/participant/collaboration" className="block group">
            <Card className="cursor-pointer h-full bg-gradient-to-r from-primary via-blue-600 to-cyan-500 border-2 border-white/30 shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="rounded-full bg-white/20 backdrop-blur-sm p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb className="size-5 sm:size-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white">Collaboration</h3>
                    <p className="text-xs text-white/80">
                      {user.participant_type === 'offline' ? 'Create idea group' : 'Submit ideas'}
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
            className="cursor-pointer bg-gradient-to-r from-primary via-blue-600 to-cyan-500 border-2 border-white/30 shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50 group"
            onClick={() => setIsZoomDialogOpen(true)}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="rounded-full bg-white/20 backdrop-blur-sm p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300">
                  <Video className="size-5 sm:size-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white">Join Zoom Meeting</h3>
                  <p className="text-xs text-white/80">
                    Join virtual session
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Third Row: Booth Voting Card - Available for all participants */}
        <Card
          className="cursor-pointer bg-gradient-to-r from-primary via-blue-600 to-cyan-500 border-2 border-white/30 shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50 group"
          onClick={() => setIsVotingDialogOpen(true)}
        >
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="rounded-full bg-white/20 backdrop-blur-sm p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="size-5 sm:size-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white">Booth Voting</h3>
                <p className="text-xs text-white/80">
                  Vote for your favorite booths
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fourth Row: Wall of Expert Card - Available for all participants */}
        <Card
          className="cursor-pointer bg-gradient-to-r from-primary via-blue-600 to-cyan-500 border-2 border-white/30 shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50 group"
          onClick={() => setIsWallOfExpertDialogOpen(true)}
        >
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="rounded-full bg-white/20 backdrop-blur-sm p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="size-5 sm:size-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white">Wall of Expert</h3>
                <p className="text-xs text-white/80">
                  View expert showcase
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voucher Section - Moved to bottom */}
      <Card className="relative overflow-hidden border-2 border-primary/30 shadow-xl shadow-primary/20 bg-gradient-to-br from-card via-card to-amber-100">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />

        <CardHeader className="relative pb-3">
          <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent font-bold">
            Voucher & Lucky Draw
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {!isEligible ? (
            // Locked State
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-400/20 to-gray-500/10 blur-xl" />
                <div className="relative rounded-full bg-gradient-to-br from-gray-200/50 to-gray-300/30 p-5 sm:p-7 border-2 border-gray-300/40">
                  <Lock className="size-8 sm:size-12 text-gray-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base sm:text-lg">Voucher Locked</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Complete <span className="font-bold text-primary">{remainingBooths} more booth{remainingBooths > 1 ? 's' : ''}</span> to unlock voucher and participate in the lucky draw
                </p>
              </div>
            </div>
          ) : (
            // Unlocked State
            <div className="space-y-4">
              {/* Voucher Image Placeholder */}
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-br from-primary via-blue-500 to-amber-400 border-6 border-white/40 shadow-2xl shadow-primary/30">
                <div className="absolute inset-0 bg-grid-white/10" />
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="text-center space-y-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-white/30 blur-2xl" />
                      <CheckCircle2 className="relative size-14 sm:size-20 text-white mx-auto drop-shadow-lg" />
                    </div>
                    <p className="font-bold text-xl sm:text-2xl text-white drop-shadow-lg">
                      Voucher Unlocked!
                    </p>
                  </div>
                </div>
              </div>

              {/* Eligibility Badge */}
              <div className="rounded-xl bg-gradient-to-br from-green-500/15 to-emerald-500/10 p-4 border-2 border-green-500/40 shadow-lg shadow-green-500/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-500/20 p-2">
                    <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-green-700 dark:text-green-300">
                      You're Eligible!
                    </p>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">
                      Congratulations! You are eligible to participate in the Expert Forum 2025 lucky draw
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

      {/* Booth Voting Dialog - Dialog for desktop, Bottom Sheet for mobile */}
      <BoothVotingDialog
        open={isVotingDialogOpen}
        onOpenChange={setIsVotingDialogOpen}
        user={user}
      />

      {/* Wall of Expert Dialog - Dialog for desktop, Bottom Sheet for mobile */}
      <WallOfExpertDialog
        open={isWallOfExpertDialogOpen}
        onOpenChange={setIsWallOfExpertDialogOpen}
      />
    </div>
  )
}

export default ParticipantIndexPage
