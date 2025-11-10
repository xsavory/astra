import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Trophy, Sparkles, History, Play, Check, X, RotateCcw } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
  Skeleton,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import { cn } from '@repo/react-components/lib'
import useAuth from 'src/hooks/use-auth'
import api from 'src/lib/api'
import type { User, DrawLogWithDetails } from 'src/types/schema'
import PageLoader from 'src/components/page-loader'

import bgImage from 'src/assets/background.png'
import bgMobileImage from 'src/assets/background-mobile.png'
import logoHeadline from 'src/assets/logo-headline.png'

export const Route = createFileRoute('/staff/draw')({
  component: StaffDrawPage,
  pendingComponent: PageLoader,
})

const DRAW_ANIMATION_DURATION = 4000 // 4 seconds
const CARD_CYCLE_INTERVAL = 100 // Card change speed during animation

type DrawState = 'idle' | 'drawing' | 'winner-revealed' | 'confirming'

function StaffDrawPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  // State
  const [drawState, setDrawState] = useState<DrawState>('idle')
  const [selectedWinner, setSelectedWinner] = useState<User | null>(null)
  const [animatingCard, setAnimatingCard] = useState<User | null>(null)
  const [cachedWinners, setCachedWinners] = useState<User[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)

  // Queries
  const { data: eligibleParticipants = [], isLoading: isLoadingParticipants } = useQuery<User[]>({
    queryKey: ['eligible-participants'],
    queryFn: () => api.draws.getEligibleParticipants(),
  })

  const { data: drawHistory = [], isLoading: isLoadingHistory } = useQuery<DrawLogWithDetails[]>({
    queryKey: ['draw-history'],
    queryFn: () => api.draws.getDrawHistory(),
  })

  // Mutations
  const submitDrawMutation = useMutation({
    mutationFn: (winnerIds: string[]) => api.draws.submitDraw(winnerIds, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligible-participants'] })
      queryClient.invalidateQueries({ queryKey: ['draw-history'] })
      setCachedWinners([])
      localStorage.removeItem('draw_cached_winners')
      setDrawState('idle')
      setShowConfirmDialog(false)
    },
  })

  // Load cached winners from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('draw_cached_winners')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setCachedWinners(parsed)
      } catch {
        localStorage.removeItem('draw_cached_winners')
      }
    }
  }, [])

  // Save cached winners to localStorage
  useEffect(() => {
    if (cachedWinners.length > 0) {
      localStorage.setItem('draw_cached_winners', JSON.stringify(cachedWinners))
    }
  }, [cachedWinners])

  // Start draw animation
  const handleStartDraw = () => {
    // Use availableParticipants (already filtered to exclude cached winners and previous winners)
    if (availableParticipants.length === 0) return

    setDrawState('drawing')

    // Create snapshot of available participants at draw start
    // This prevents issues if availableParticipants changes during animation
    const participantsSnapshot = [...availableParticipants]

    // Animate cycling through participants
    let cycleCount = 0
    const maxCycles = DRAW_ANIMATION_DURATION / CARD_CYCLE_INTERVAL

    const cycleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participantsSnapshot.length)
      const randomParticipant = participantsSnapshot[randomIndex]
      if (randomParticipant) {
        setAnimatingCard(randomParticipant)
      }
      cycleCount++

      if (cycleCount >= maxCycles) {
        clearInterval(cycleInterval)
        // Final random selection from snapshot
        const winnerIndex = Math.floor(Math.random() * participantsSnapshot.length)
        const winner = participantsSnapshot[winnerIndex]
        if (winner) {
          setSelectedWinner(winner)
          setAnimatingCard(winner)
        }

        // Transition to winner reveal
        setTimeout(() => {
          setDrawState('winner-revealed')
        }, 300)
      }
    }, CARD_CYCLE_INTERVAL)
  }

  // Confirm single winner
  const handleConfirmWinner = () => {
    if (!selectedWinner) return

    // Check if winner is already in cached winners
    const isAlreadyCached = cachedWinners.some(w => w.id === selectedWinner.id)
    if (isAlreadyCached) {
      // Winner already cached, just reset
      setSelectedWinner(null)
      setAnimatingCard(null)
      setDrawState('idle')
      return
    }

    // Add to cached winners
    setCachedWinners(prev => [...prev, selectedWinner])

    // Reset for next draw
    setSelectedWinner(null)
    setAnimatingCard(null)
    setDrawState('idle')
  }

  // Redraw
  const handleRedraw = () => {
    setSelectedWinner(null)
    setAnimatingCard(null)
    setDrawState('idle')
  }

  // Remove from cached winners
  const handleRemoveCachedWinner = (winnerId: string) => {
    setCachedWinners(prev => prev.filter(w => w.id !== winnerId))
  }

  // Submit all cached winners
  const handleSubmitDraw = () => {
    if (cachedWinners.length === 0) return
    submitDrawMutation.mutate(cachedWinners.map(w => w.id))
  }

  // Filter out already cached winners from eligible participants
  const availableParticipants = eligibleParticipants.filter(
    p => !cachedWinners.some(w => w.id === p.id)
  )

  if (isLoadingParticipants) {
    return <PageLoader />
  }

  return (
    <div className='min-w-screen min-h-screen relative overflow-hidden'>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={isMobile ? bgMobileImage : bgImage}
          alt="Background"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="container px-4 py-6 mx-auto h-screen">
        <div className="flex gap-4 h-full max-w-7xl mx-auto">
          {/* Left Column - Logo, Stats, Winners List */}
          <div className="w-80 flex flex-col gap-3 overflow-hidden">
            {/* Logo */}
            <div className="flex justify-center shrink-0 z-15">
              <img
                src={logoHeadline}
                alt="The 9th Expert Forum"
                className="h-auto w-full max-w-xs"
              />
            </div>

            {/* Stats Card - Unified */}
            <Card className="border border-cyan-200 bg-white/80 backdrop-blur shrink-0 p-2">
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[9px] font-medium text-muted-foreground">Eligible</p>
                    <p className="text-base font-bold text-primary">{availableParticipants.length}</p>
                  </div>
                  <div className="text-center border-x border-cyan-200">
                    <p className="text-[9px] font-medium text-muted-foreground">Selected</p>
                    <p className="text-base font-bold text-primary">{cachedWinners.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-medium text-muted-foreground">Draws</p>
                    <p className="text-base font-bold text-primary">{drawHistory.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Winners List */}
            <Card className="gap-0 pt-4 border-2 border-cyan-200 bg-white/90 backdrop-blur shadow-xl flex flex-col flex-1 min-h-0 overflow-hidden">
              <CardHeader className="border-b pb-0!">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Trophy className="size-4 text-cyan-600" />
                    <div>Winners</div>
                    <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-xs">
                      {cachedWinners.length}
                    </Badge>
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistoryDialog(true)}
                    className="border-cyan-300 hover:bg-cyan-50 text-[10px] h-7"
                  >
                    <History className="size-3 mr-1" />
                    History ({drawHistory.length})
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-2 min-h-0 overflow-hidden">
                {cachedWinners.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground text-xs text-center px-2">
                      Belum ada winners yang dipilih.<br />Mulai undian untuk memilih pemenang.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                      {cachedWinners.map((winner, index) => (
                        <Card key={winner.id} className="py-2 border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 shrink-0 my-2">
                          <CardContent className="flex items-start gap-2">
                            <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 shrink-0 text-[10px] px-1.5">
                              #{index + 1}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs truncate">{winner.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{winner.email}</p>
                              {winner.company && (
                                <p className="text-[10px] text-muted-foreground truncate">{winner.company}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCachedWinner(winner.id)}
                              className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600 shrink-0"
                            >
                              <X className="size-3" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex gap-1.5 pt-2 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setShowConfirmDialog(true)}
                        className="border-cyan-300 hover:bg-cyan-50 text-[10px] h-7"
                      >
                        <Check className="size-3 mr-1" />
                        Submit ({cachedWinners.length})
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setCachedWinners([])
                          localStorage.removeItem('draw_cached_winners')
                        }}
                        className="border-red-300 hover:bg-red-50 hover:text-red-600 text-[10px] h-7"
                      >
                        <X className="size-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Draw Area (Standout/Prominent) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Card className="bg-gradient-to-r from-primary to-cyan-600 border-2 border-cyan-200 backdrop-blur shadow-2xl flex-1 flex flex-col overflow-hidden">
              <CardContent className="flex-1 flex flex-col justify-center overflow-hidden p-8">
                {drawState === 'idle' && (
                  <div className="text-center space-y-8">
                    {availableParticipants.length === 0 ? (
                      <Alert className="border-cyan-200">
                        <AlertDescription className="text-center">
                          Tidak ada peserta yang eligible untuk mengikuti undian.
                          {cachedWinners.length > 0 && " Silakan submit winners yang sudah dipilih."}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <Button
                          size="lg"
                          onClick={handleStartDraw}
                          className="bg-white cursor-pointer h-16 px-12 text-xl text-primary font-bold shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105 hover:bg-white"
                        >
                          <Play className="size-6 mr-2" />
                          Mulai Undian
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {drawState === 'drawing' && (
                  <DrawingAnimation participant={animatingCard} />
                )}

                {drawState === 'winner-revealed' && selectedWinner && (
                  <WinnerReveal
                    winner={selectedWinner}
                    onConfirm={handleConfirmWinner}
                    onRedraw={handleRedraw}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Submit Winners</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin submit {cachedWinners.length} winner{cachedWinners.length > 1 ? 's' : ''}?
                Aksi ini tidak dapat dibatalkan dan winners akan dicatat ke database.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {cachedWinners.map((winner, index) => (
                <div
                  key={winner.id}
                  className="p-3 bg-cyan-50 rounded-md border border-cyan-200"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{winner.name}</p>
                      <p className="text-sm text-muted-foreground">{winner.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={submitDrawMutation.isPending}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitDraw}
                disabled={submitDrawMutation.isPending}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                <Check className="size-4 mr-2" />
                {submitDrawMutation.isPending ? 'Submitting...' : 'Submit Winners'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="size-5 text-cyan-600" />
                Riwayat Undian
              </DialogTitle>
              <DialogDescription>
                Total {drawHistory.length} undian yang telah dilakukan
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[60vh] pr-2">
              {isLoadingHistory ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : drawHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada riwayat undian
                </p>
              ) : (
                <div className="space-y-3">
                  {drawHistory.map((draw, index) => (
                    <Card key={draw.id} className="border border-cyan-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge variant="secondary" className="bg-cyan-100 text-cyan-900">
                              Draw #{drawHistory.length - index}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(draw.created_at).toLocaleString('id-ID', {
                                dateStyle: 'full',
                                timeStyle: 'short'
                              })}
                            </p>
                            {draw.staff && (
                              <p className="text-xs text-muted-foreground">
                                Oleh: {draw.staff.name}
                              </p>
                            )}
                          </div>
                          <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600">
                            {draw.winners?.length || 0} Winner{(draw.winners?.length || 0) > 1 ? 's' : ''}
                          </Badge>
                        </div>

                        {draw.winners && draw.winners.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {draw.winners.map((winner) => (
                              <div
                                key={winner.id}
                                className="p-2 bg-cyan-50 rounded-md border border-cyan-200"
                              >
                                <p className="font-medium text-sm">{winner.name}</p>
                                <p className="text-xs text-muted-foreground">{winner.company}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Drawing Animation Component
function DrawingAnimation({ participant }: { participant: User | null }) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
  }, [])

  if (!participant) {
    return (
      <div className="text-center p-6">
        <div className="size-32 mx-auto bg-gradient-to-br from-cyan-200 to-blue-200 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="text-center space-y-2">
      <div className="space-y-3">
        <Sparkles className="size-14 mx-auto text-white animate-spin" />
        <h2 className="text-xl font-bold text-white">
          Drawing...
        </h2>
      </div>

      <div
        className={cn(
          "mx-auto max-w-md transform transition-all duration-200",
          isAnimating ? "scale-100 opacity-100 blur-sm" : "scale-95 opacity-0"
        )}
      >
        <Card className="border-2 border-primary shadow-2xl shadow-primary/30 bg-gradient-to-br from-cyan-50 via-white to-blue-50">
          <CardContent className="p-8 space-y-3">
            <div className="size-20 mx-auto bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-xl">{participant.name}</p>
              <p className="text-sm text-muted-foreground">{participant.email}</p>
              {participant.company && (
                <p className="text-sm text-muted-foreground font-medium">{participant.company}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Winner Reveal Component
function WinnerReveal({
  winner,
  onConfirm,
  onRedraw,
}: {
  winner: User
  onConfirm: () => void
  onRedraw: () => void
}) {
  const [isRevealing, setIsRevealing] = useState(false)

  useEffect(() => {
    setIsRevealing(true)
  }, [])

  return (
    <div className="text-center space-y-6">
      {/* Winner Card */}
      <div
        className={cn(
          "mx-auto max-w-md transition-all duration-500 delay-500",
          isRevealing ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 rotate-12"
        )}
      >
        <Card className="border-4 border-cyan-500 shadow-2xl shadow-cyan-500/50 bg-gradient-to-br from-cyan-50 via-white to-blue-50">
          <CardContent className="p-8 space-y-3">
            <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-base px-3 py-1">
              <Trophy className="size-4 mr-1" />
              WINNER
            </Badge>

            <div className="size-24 mx-auto bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              {winner.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <p className="font-bold text-2xl">{winner.name}</p>
              <p className="text-muted-foreground text-sm">{winner.email}</p>
              {winner.company && (
                <p className="text-base font-semibold text-cyan-700">{winner.company}</p>
              )}
              {winner.division && (
                <p className="text-sm text-muted-foreground">{winner.division}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div
        className={cn(
          "flex gap-3 justify-center transition-all duration-700 delay-700",
          isRevealing ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <Button
          variant="outline"
          onClick={onRedraw}
          size="lg"
          className="border-2 border-slate-300 hover:bg-slate-50"
        >
          <RotateCcw className="size-4 mr-2" />
          Undi Ulang
        </Button>

        <Button
          onClick={onConfirm}
          size="lg"
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30"
        >
          <Check className="size-4 mr-2" />
          Konfirmasi Winner
        </Button>
      </div>
    </div>
  )
}

export default StaffDrawPage
