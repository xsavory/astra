import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Users, TrendingUp, Lock, Loader2, AlertTriangle, AlertCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
  Badge,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import api from 'src/lib/api'
import type { BoothWithVoteStats } from 'src/types/schema'
import PageLoader from 'src/components/page-loader'
import useAuth from 'src/hooks/use-auth'

import bgImage from 'src/assets/background.png'
import bgMobileImage from 'src/assets/background-mobile.png'
import logoHeadline from 'src/assets/logo-headline.png'

export const Route = createFileRoute('/staff/votes')({
  component: StaffVotesPage,
  pendingComponent: PageLoader,
})

const REFRESH_INTERVAL = 10000 // 10 seconds
const ANIMATION_DURATION = 1000 // 1 second pulse animation

function StaffVotesPage() {
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [animatingBoothIds, setAnimatingBoothIds] = useState<Set<string>>(new Set())
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)

  // Fetch booth votes with auto-refresh
  const {
    data: boothsWithVotes = [],
    isLoading,
    refetch,
  } = useQuery<BoothWithVoteStats[]>({
    queryKey: ['booth-votes-stats'],
    queryFn: () => api.votes.getAllBoothVotesWithDetails(),
    refetchInterval: REFRESH_INTERVAL,
  })

  // Fetch total voters
  const { data: totalVoters = 0 } = useQuery<number>({
    queryKey: ['total-voters'],
    queryFn: () => api.votes.getTotalVoters(),
    refetchInterval: REFRESH_INTERVAL,
  })

  // Fetch current event and voting state
  const { data: event } = useQuery({
    queryKey: ['current-event'],
    queryFn: () => api.events.getEvent(),
    refetchInterval: REFRESH_INTERVAL,
  })

  // Finalize results mutation
  const finalizeResultsMutation = useMutation({
    mutationFn: async () => {
      if (!event || !user) {
        throw new Error('Missing event or user data')
      }
      await api.voteResults.submitFinalResults(event.id, user.id, boothsWithVotes)
    },
    onSuccess: () => {
      // Refresh event data to reflect locked state
      queryClient.invalidateQueries({ queryKey: ['current-event'] })
      setShowFinalizeDialog(false)
    },
  })

  // Subscribe to realtime vote changes
  useEffect(() => {
    const channel = api.votes.subscribeToUserVotes('*', () => {
      // Refetch data when new votes come in
      refetch()
    })

    return () => {
      channel()
    }
  }, [refetch])

  // Detect vote count changes and trigger animation
  useEffect(() => {
    if (boothsWithVotes.length === 0) return

    // Compare with previous data to detect changes
    const previousData = sessionStorage.getItem('previous-booth-votes')
    if (previousData) {
      try {
        const previous: BoothWithVoteStats[] = JSON.parse(previousData)
        const changedBooths = boothsWithVotes.filter((booth) => {
          const prevBooth = previous.find((b) => b.id === booth.id)
          return prevBooth && prevBooth.vote_count < booth.vote_count
        })

        if (changedBooths.length > 0) {
          // Add changed booths to animation set
          setAnimatingBoothIds(new Set(changedBooths.map((b) => b.id)))

          // Remove animation after duration
          setTimeout(() => {
            setAnimatingBoothIds(new Set())
          }, ANIMATION_DURATION)
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Store current data for next comparison
    sessionStorage.setItem('previous-booth-votes', JSON.stringify(boothsWithVotes))
  }, [boothsWithVotes])

  // Get top 3 booths
  const topThree = boothsWithVotes.slice(0, 3)
  const remainingBooths = boothsWithVotes.slice(3)

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={isMobile ? bgMobileImage : bgImage}
          alt="Background"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Floating Finalize Button - Top Left */}
      {!event?.is_votes_lock && (
        <div className="fixed top-6 left-6 z-50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFinalizeDialog(true)}
          >
            <Lock />
          </Button>
        </div>
      )}

      {/* Locked Badge - Top Left (when locked) */}
      {event?.is_votes_lock && (
        <div className="fixed top-6 left-6 z-50">
          <Badge className="px-4 py-2 text-sm font-semibold bg-gray-600 text-white shadow-xl">
            <Lock className="size-4 mr-2" />
            Results Finalized
          </Badge>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-600" />
              Finalize Voting Results
            </DialogTitle>
            <DialogDescription>
              This action will permanently lock the voting and save the current results.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Current statistics:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Total Voters: <strong>{totalVoters}</strong></li>
              <li>Total Votes: <strong>{boothsWithVotes.reduce((sum, b) => sum + b.vote_count, 0)}</strong></li>
              <li>Booths: <strong>{boothsWithVotes.length}</strong></li>
            </ul>
          </div>

          {finalizeResultsMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                {finalizeResultsMutation.error instanceof Error
                  ? finalizeResultsMutation.error.message
                  : 'Failed to finalize results. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFinalizeDialog(false)}
              disabled={finalizeResultsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => finalizeResultsMutation.mutate()}
              disabled={finalizeResultsMutation.isPending}
            >
              {finalizeResultsMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <Lock className="size-4 mr-2" />
                  Confirm Finalize
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container px-4 py-4 mx-auto h-screen relative z-10 flex flex-col">
        {/* Logo */}
        <div className="flex justify-center shrink-0">
          <img
            src={logoHeadline}
            alt="The 9th Expert Forum"
            className="h-auto w-full max-w-sm"
          />
        </div>

        {/* Title and Stats */}
        <div className="text-center shrink-0 my-3">

          {/* Stats Card */}
          <Card className="p-2 inline-block bg-white/90 backdrop-blur border-2 border-primary/30">
            <CardContent className="px-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <span className="text-sm font-semibold">
                    Total Voters: <span className="text-primary">{totalVoters}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-cyan-600" />
                  <span className="text-sm font-semibold">
                    Total Votes: <span className="text-cyan-600">{boothsWithVotes.reduce((sum, b) => sum + b.vote_count, 0)}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Area - Fixed Height */}
        <div className="flex-1 max-w-7xl mx-auto w-full overflow-hidden flex flex-col gap-6">
          {/* Top 3 Podium */}
          <div className="shrink-0">
            <div className="grid grid-cols-3 gap-3 items-end">
              {/* 2nd Place - Left */}
              {topThree[1] && (
                <PodiumCard
                  booth={topThree[1]}
                  rank={2}
                  color="silver"
                  isAnimating={animatingBoothIds.has(topThree[1].id)}
                />
              )}

              {/* 1st Place - Center (Tallest) */}
              {topThree[0] && (
                <PodiumCard
                  booth={topThree[0]}
                  rank={1}
                  color="gold"
                  isAnimating={animatingBoothIds.has(topThree[0].id)}
                />
              )}

              {/* 3rd Place - Right */}
              {topThree[2] && (
                <PodiumCard
                  booth={topThree[2]}
                  rank={3}
                  color="bronze"
                  isAnimating={animatingBoothIds.has(topThree[2].id)}
                />
              )}
            </div>
          </div>

          {/* Remaining Booths - Compact Grid */}
          {remainingBooths.length > 0 && (
            <div className="flex-1 min-h-0">
              <div className="grid grid-cols-3 gap-3 h-[calc(100%-2rem)] content-start overflow-hidden">
                {remainingBooths.map((booth) => (
                  <Card
                    key={booth.id}
                    className={`backdrop-blur border transition-all duration-300 ${
                      animatingBoothIds.has(booth.id)
                        ? 'bg-yellow-600/80 border-yellow-300 shadow-lg shadow-primary/50 scale-105'
                        : 'bg-gradient-to-r from-primary to-cyan-600/80 border-gray-300'
                    }`}
                  >
                    <CardContent className="w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-lg text-primary font-bold flex justify-center shrink-0 w-8 rounded-full bg-white">
                            {booth.rank}
                          </span>
                          <h3 className="text-white text-xl font-semibold line-clamp-1">{booth.name}</h3>
                        </div>
                        <span className="text-lg font-bold text-white shrink-0 ml-2">
                          {booth.vote_count} <span className='text-sm'>Votes</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PodiumCardProps {
  booth: BoothWithVoteStats
  rank: 1 | 2 | 3
  color: 'gold' | 'silver' | 'bronze'
  isAnimating: boolean
}

function PodiumCard({ booth, rank, color, isAnimating }: PodiumCardProps) {
  const colorClasses = {
    gold: {
      gradient: 'from-amber-300 via-yellow-400 to-amber-500',
      gradientHover: 'from-amber-400 via-yellow-500 to-amber-600',
      shadow: 'shadow-amber-500/50',
      glow: 'shadow-amber-400/30',
      text: 'text-amber-900',
      height: 'h-[240px]',
      rankFont: 'text-[200px] leading-[140px]',
      boothNameFont: 'text-3xl', 
    },
    silver: {
      gradient: 'from-slate-300 via-gray-200 to-slate-400',
      gradientHover: 'from-slate-400 via-gray-300 to-slate-500',
      shadow: 'shadow-slate-500/50',
      glow: 'shadow-slate-400/30',
      text: 'text-slate-800',
      height: 'h-[200px]',
      rankFont: 'text-[160px] leading-[118px]',
      boothNameFont: 'text-2xl',
    },
    bronze: {
      gradient: 'from-orange-300 via-orange-200 to-amber-300',
      gradientHover: 'from-orange-400 via-orange-300 to-amber-400',
      shadow: 'shadow-orange-400/40',
      glow: 'shadow-orange-300/30',
      text: 'text-orange-800',
      height: 'h-[180px]',
      rankFont: 'text-[140px] leading-[104px]',
      boothNameFont: 'text-xl',
    },
  }

  const styles = colorClasses[color]

  return (
    <div
      className={`relative ${styles.height} rounded-xl overflow-hidden transition-all duration-500 ${
        isAnimating
          ? `${styles.shadow} shadow-2xl scale-105 animate-pulse ring-4 ring-white/50`
          : `shadow-xl ${styles.glow}`
      }`}
    >
      {/* Gradient Background with 3D effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-100`} />
      <div className={`absolute inset-0 bg-gradient-to-tr ${styles.gradientHover} opacity-0 hover:opacity-100 transition-opacity duration-500`} />

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60" />

      {/* Large Rank Number Background (Watermark) - Positioned Right */}
      <div className="absolute right-0 bottom-0 overflow-hidden">
        <div className={`${styles.rankFont} font-black bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent select-none`}>
          {rank}
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center z-10">
        {/* Booth Name */}
        <h3 className={`${styles.boothNameFont} font-black text-center mb-4 line-clamp-2 ${styles.text} drop-shadow-sm`}>
          {booth.name}
        </h3>

        {/* Vote Count */}
        <div className="text-center">
          <div className={`text-5xl font-black ${styles.text} mb-1 drop-shadow-sm`}>
            {booth.vote_count}
          </div>
          <div className={`text-sm font-bold ${styles.text} opacity-80`}>
            VOTES
          </div>
        </div>
      </div>

      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  )
}

export default StaffVotesPage
