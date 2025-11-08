import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Trophy, Sparkles, Users, History, Play, Check, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
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
import { cn } from '@repo/react-components/lib'
import useAuth from 'src/hooks/use-auth'
import api from 'src/lib/api'
import type { User, DrawLogWithDetails } from 'src/types/schema'
import PageLoader from 'src/components/page-loader'

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

  // State
  const [drawState, setDrawState] = useState<DrawState>('idle')
  const [selectedWinner, setSelectedWinner] = useState<User | null>(null)
  const [animatingCard, setAnimatingCard] = useState<User | null>(null)
  const [cachedWinners, setCachedWinners] = useState<User[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showHistoryCollapsed, setShowHistoryCollapsed] = useState(true)

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
    if (eligibleParticipants.length === 0) return

    setDrawState('drawing')

    // Animate cycling through participants
    let cycleCount = 0
    const maxCycles = DRAW_ANIMATION_DURATION / CARD_CYCLE_INTERVAL

    const cycleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleParticipants.length)
      const randomParticipant = eligibleParticipants[randomIndex]
      if (randomParticipant) {
        setAnimatingCard(randomParticipant)
      }
      cycleCount++

      if (cycleCount >= maxCycles) {
        clearInterval(cycleInterval)
        // Final random selection
        const winnerIndex = Math.floor(Math.random() * eligibleParticipants.length)
        const winner = eligibleParticipants[winnerIndex]
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="size-10 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Lucky Draw
            </h1>
            <Trophy className="size-10 text-yellow-500" />
          </div>
          <p className="text-muted-foreground text-lg">
            Draw pemenang dari peserta yang eligible
          </p>
        </div>

        {/* Stats Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Users className="size-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Eligible Participants</p>
                </div>
                <p className="text-4xl font-bold text-primary">{availableParticipants.length}</p>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="size-5 text-yellow-600" />
                  <p className="text-sm font-medium text-muted-foreground">Selected Winners</p>
                </div>
                <p className="text-4xl font-bold text-yellow-600">{cachedWinners.length}</p>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <History className="size-5 text-green-600" />
                  <p className="text-sm font-medium text-muted-foreground">Total Draws</p>
                </div>
                <p className="text-4xl font-bold text-green-600">{drawHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Draw Area */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            {drawState === 'idle' && (
              <div className="text-center space-y-8">
                {availableParticipants.length === 0 ? (
                  <Alert>
                    <AlertDescription className="text-center">
                      Tidak ada peserta yang eligible untuk mengikuti undian.
                      {cachedWinners.length > 0 && " Silakan submit winners yang sudah dipilih atau hapus dari daftar."}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-4">
                      <Sparkles className="size-20 mx-auto text-yellow-500 animate-pulse" />
                      <div>
                        <h2 className="text-3xl font-bold mb-2">Siap untuk mengundi?</h2>
                        <p className="text-muted-foreground">
                          {availableParticipants.length} peserta menunggu kesempatan mereka
                        </p>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleStartDraw}
                      className="relative h-16 px-12 text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 border-2 border-white/30 shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/70"
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

        {/* Cached Winners */}
        {cachedWinners.length > 0 && (
          <Card className="border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-50/50 via-card to-yellow-500/5 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-5 text-yellow-600" />
                Winners Terpilih ({cachedWinners.length})
              </CardTitle>
              <CardDescription>
                Winners yang sudah terpilih dan siap untuk disubmit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cachedWinners.map((winner, index) => (
                  <Card key={winner.id} className="border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-50 to-white">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-500">
                          Winner #{index + 1}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCachedWinner(winner.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="font-bold text-lg">{winner.name}</p>
                        <p className="text-sm text-muted-foreground">{winner.email}</p>
                        {winner.company && (
                          <p className="text-sm text-muted-foreground">{winner.company}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(true)}
                  size="lg"
                  className="border-2 border-yellow-500/30 hover:bg-yellow-50"
                >
                  <Check className="size-5 mr-2" />
                  Submit {cachedWinners.length} Winner{cachedWinners.length > 1 ? 's' : ''}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setCachedWinners([])
                    localStorage.removeItem('draw_cached_winners')
                  }}
                  size="lg"
                  className="border-2 border-red-500/30 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="size-5 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Draw History */}
        <Card className="border-2 border-slate-200 shadow-lg">
          <CardHeader
            className="cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setShowHistoryCollapsed(!showHistoryCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="size-5" />
                Riwayat Undian
              </CardTitle>
              <Button variant="ghost" size="sm">
                {showHistoryCollapsed ? (
                  <ChevronDown className="size-5" />
                ) : (
                  <ChevronUp className="size-5" />
                )}
              </Button>
            </div>
          </CardHeader>

          {!showHistoryCollapsed && (
            <CardContent>
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
                    <Card key={draw.id} className="border border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge variant="secondary">
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
                          <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-500">
                            {draw.winners?.length || 0} Winner{(draw.winners?.length || 0) > 1 ? 's' : ''}
                          </Badge>
                        </div>

                        {draw.winners && draw.winners.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {draw.winners.map((winner) => (
                              <div
                                key={winner.id}
                                className="p-2 bg-slate-50 rounded-md border border-slate-200"
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
            </CardContent>
          )}
        </Card>
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
                className="p-3 bg-slate-50 rounded-md border border-slate-200"
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
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
            >
              <Check className="size-4 mr-2" />
              {submitDrawMutation.isPending ? 'Submitting...' : 'Submit Winners'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      <div className="text-center py-20">
        <div className="size-32 mx-auto bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="text-center space-y-8 py-8">
      <div className="space-y-4">
        <Sparkles className="size-16 mx-auto text-yellow-500 animate-spin" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Mengundi...
        </h2>
      </div>

      <div
        className={cn(
          "mx-auto max-w-md transform transition-all duration-200",
          isAnimating ? "scale-100 opacity-100 blur-xs" : "scale-95 opacity-0"
        )}
      >
        <Card className="border-2 border-primary shadow-2xl shadow-primary/30 bg-gradient-to-br from-white via-purple-50 to-pink-50">
          <CardContent className="p-8 space-y-3">
            <div className="size-20 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
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
    <div className="text-center space-y-8 py-8">
      {/* Celebration */}
      <div
        className={cn(
          "transition-all duration-700",
          isRevealing ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}
      >
        <Trophy className="size-24 mx-auto text-yellow-500 drop-shadow-2xl animate-bounce" />
      </div>

      {/* Title */}
      <div
        className={cn(
          "transition-all duration-700 delay-300",
          isRevealing ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
          Selamat!
        </h2>
        <p className="text-muted-foreground mt-2">Kami memiliki pemenang!</p>
      </div>

      {/* Winner Card */}
      <div
        className={cn(
          "mx-auto max-w-md transition-all duration-700 delay-500",
          isRevealing ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 rotate-12"
        )}
      >
        <Card className="border-4 border-yellow-500 shadow-2xl shadow-yellow-500/50 bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
          <CardContent className="p-10 space-y-4">
            <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-lg px-4 py-1">
              <Trophy className="size-4 mr-2" />
              WINNER
            </Badge>

            <div className="size-28 mx-auto bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {winner.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-2">
              <p className="font-bold text-3xl">{winner.name}</p>
              <p className="text-muted-foreground">{winner.email}</p>
              {winner.company && (
                <p className="text-lg font-semibold text-primary">{winner.company}</p>
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
          "flex gap-4 justify-center transition-all duration-700 delay-700",
          isRevealing ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <Button
          variant="outline"
          onClick={onRedraw}
          size="lg"
          className="border-2 border-slate-300 hover:bg-slate-50"
        >
          <RotateCcw className="size-5 mr-2" />
          Undi Ulang
        </Button>

        <Button
          onClick={onConfirm}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-xl shadow-green-500/30"
        >
          <Check className="size-5 mr-2" />
          Konfirmasi Winner
        </Button>
      </div>
    </div>
  )
}

export default StaffDrawPage
