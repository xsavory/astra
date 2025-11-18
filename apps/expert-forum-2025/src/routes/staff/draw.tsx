import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { Trophy, History, Check, X, ListTodo } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
  Skeleton,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import useAuth from 'src/hooks/use-auth'
import api from 'src/lib/api'
import type { User, DrawLogWithDetails, PrizeTemplate, DrawSlot, CachedDrawSession } from 'src/types/schema'
import PageLoader from 'src/components/page-loader'
import { TemplateSelector } from 'src/components/draw-template-selector'
import { MultiSlotDrawing } from 'src/components/draw-multi-slot-drawing'
import { MultiSlotReveal } from 'src/components/draw-multi-slot-reveal'
import { PRIZE_TEMPLATES, DEFAULT_TEMPLATE } from 'src/lib/constants'

import bgImage from 'src/assets/background.png'
import bgMobileImage from 'src/assets/background-mobile.png'
import logoHeadline from 'src/assets/logo-headline.png'

export const Route = createFileRoute('/staff/draw')({
  component: StaffDrawPage,
  pendingComponent: PageLoader,
})

const DRAW_ANIMATION_DURATION = 5000 // 5 seconds
const CARD_CYCLE_INTERVAL = 80 // Card change speed during animation

type DrawState = 'idle' | 'drawing' | 'revealed'

function StaffDrawPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  // State
  const [drawState, setDrawState] = useState<DrawState>('idle')
  const [selectedTemplate, setSelectedTemplate] = useState<PrizeTemplate>(DEFAULT_TEMPLATE)
  const [drawSlots, setDrawSlots] = useState<DrawSlot[]>([])
  const [cachedSessions, setCachedSessions] = useState<CachedDrawSession[]>([])
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showWinnersDialog, setShowWinnersDialog] = useState(false)

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
    mutationFn: (params: { sessionId: string }) => {
      const session = cachedSessions.find(s => s.id === params.sessionId)
      if (!session) throw new Error('Session not found')

      return api.draws.submitDraw(
        session.winners.map(w => w.participant.id),
        user?.id,
        session.templateId,
        session.templateName,
        session.slotCount
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eligible-participants'] })
      queryClient.invalidateQueries({ queryKey: ['draw-history'] })

      // Remove submitted session
      setCachedSessions(prev => prev.filter(s => s.id !== variables.sessionId))

      setDrawState('idle')
    },
  })

  // Load cached sessions from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('draw_cached_sessions')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setCachedSessions(parsed)
      } catch {
        localStorage.removeItem('draw_cached_sessions')
      }
    }
  }, [])

  // Save cached sessions to localStorage
  useEffect(() => {
    if (cachedSessions.length > 0) {
      localStorage.setItem('draw_cached_sessions', JSON.stringify(cachedSessions))
    } else {
      localStorage.removeItem('draw_cached_sessions')
    }
  }, [cachedSessions])

  // Filter out already cached winners from eligible participants
  const allCachedWinnerIds = cachedSessions.flatMap(session =>
    session.winners.map(w => w.participant.id)
  )
  const availableParticipants = eligibleParticipants.filter(
    p => !allCachedWinnerIds.includes(p.id)
  )

  // Start draw animation (multi-slot)
  const handleStartDraw = useCallback(() => {
    // Validation
    if (availableParticipants.length < selectedTemplate.slotCount) {
      alert(`Not enough participants! Need ${selectedTemplate.slotCount}, available ${availableParticipants.length}`)
      return
    }

    setDrawState('drawing')

    // Initialize slots
    const slots: DrawSlot[] = Array.from({ length: selectedTemplate.slotCount }, (_, i) => ({
      slotNumber: i + 1,
      selectedWinnerId: null,
      animatingParticipantId: null,
      isRevealed: false,
    }))

    setDrawSlots(slots)

    // Create snapshot to prevent changes during animation
    const participantsSnapshot = [...availableParticipants]
    const selectedWinnerIds = new Set<string>()
    const intervals: ReturnType<typeof setInterval>[] = []

    // Create animation interval for each slot
    slots.forEach((slot) => {
      let cycleCount = 0
      const maxCycles = DRAW_ANIMATION_DURATION / CARD_CYCLE_INTERVAL

      const interval = setInterval(() => {
        // Pick random participant NOT already selected
        let randomParticipant: User | undefined
        let attempts = 0
        do {
          randomParticipant = participantsSnapshot[Math.floor(Math.random() * participantsSnapshot.length)]
          attempts++
          // Safety: prevent infinite loop
          if (attempts > 100) break
        } while (randomParticipant && selectedWinnerIds.has(randomParticipant.id) && attempts < 100)

        if (!randomParticipant) return

        // Update animating participant for this slot
        setDrawSlots(prev =>
          prev.map(s =>
            s.slotNumber === slot.slotNumber
              ? { ...s, animatingParticipantId: randomParticipant!.id }
              : s
          )
        )

        cycleCount++

        if (cycleCount >= maxCycles) {
          clearInterval(interval)

          // Final selection for this slot
          let finalWinner: User | undefined
          let attempts = 0
          do {
            finalWinner = participantsSnapshot[Math.floor(Math.random() * participantsSnapshot.length)]
            attempts++
            if (attempts > 100) break
          } while (finalWinner && selectedWinnerIds.has(finalWinner.id) && attempts < 100)

          if (!finalWinner) return

          selectedWinnerIds.add(finalWinner.id)

          // Set final winner
          setDrawSlots(prev =>
            prev.map(s =>
              s.slotNumber === slot.slotNumber
                ? {
                    ...s,
                    selectedWinnerId: finalWinner!.id,
                    animatingParticipantId: finalWinner!.id,
                    isRevealed: true,
                  }
                : s
            )
          )
        }
      }, CARD_CYCLE_INTERVAL)

      intervals.push(interval)
    })

    // After all animations complete, transition to revealed state
    setTimeout(() => {
      intervals.forEach(clearInterval)
      setDrawState('revealed')
    }, DRAW_ANIMATION_DURATION + 100)
  }, [availableParticipants, selectedTemplate])

  // Keyboard handler for spacebar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if spacebar is pressed and we're in idle state
      if (
        e.code === 'Space' &&
        drawState === 'idle' &&
        availableParticipants.length >= selectedTemplate.slotCount
      ) {
        e.preventDefault() // Prevent page scroll
        handleStartDraw()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [drawState, availableParticipants.length, selectedTemplate.slotCount, handleStartDraw])

  // Confirm winners and cache session
  const handleConfirmWinners = () => {
    if (drawSlots.length === 0) return

    // Get all winners from slots
    const winners = drawSlots
      .filter(slot => slot.selectedWinnerId)
      .map(slot => {
        const participant = eligibleParticipants.find(p => p.id === slot.selectedWinnerId)
        return {
          slotNumber: slot.slotNumber,
          participant: participant!,
        }
      })

    if (winners.length === 0) return

    // Create new session
    const newSession: CachedDrawSession = {
      id: crypto.randomUUID(),
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      slotCount: selectedTemplate.slotCount,
      winners,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    // Add to cached sessions
    setCachedSessions(prev => [...prev, newSession])

    // Reset for next draw
    setDrawSlots([])
    setDrawState('idle')
  }

  // Redraw
  const handleRedraw = () => {
    setDrawSlots([])
    setDrawState('idle')
  }

  // Remove session from cache
  const handleRemoveSession = (sessionId: string) => {
    setCachedSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  // Submit session
  const handleSubmitSession = (sessionId: string) => {
    submitDrawMutation.mutate({ sessionId })
  }

  // Get participants map for MultiSlotDrawing
  const getParticipantsMap = (): Map<number, User | null> => {
    const map = new Map<number, User | null>()
    drawSlots.forEach(slot => {
      const participant = slot.animatingParticipantId
        ? eligibleParticipants.find(p => p.id === slot.animatingParticipantId)
        : null
      map.set(slot.slotNumber, participant || null)
    })
    return map
  }

  // Get winners array for MultiSlotReveal
  const getWinnersArray = () => {
    return drawSlots
      .filter(slot => slot.selectedWinnerId)
      .map(slot => ({
        slotNumber: slot.slotNumber,
        participant: eligibleParticipants.find(p => p.id === slot.selectedWinnerId)!,
      }))
  }

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
        {/* Trigger Button - Top Left */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowWinnersDialog(true)}
          className="fixed top-6 left-6 z-20 size-10"
        >
          <ListTodo className="size-5 text-cyan-600" />
        </Button>

        <div className="flex gap-4 h-full max-w-8xl mx-auto">
          {/* Main Draw Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Logo */}
            <div className="flex justify-center shrink-0 z-15 pb-4">
              <img
                src={logoHeadline}
                alt="The 9th Expert Forum"
                className="h-auto w-full max-w-[250px]"
              />
            </div>
            <Card className="bg-transparentfrom-primary to-cyan-600 border-2 border-cyan-200 backdrop-blur shadow-2xl flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center shrink-0 z-15 px-6">
                <h2 className='relative text-5xl bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent font-bold'>DOORPRIZE</h2>

                {/* Template Selector */}
                <TemplateSelector
                  templates={PRIZE_TEMPLATES}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                  disabled={drawState !== 'idle'}
                />
              </div>

              <CardContent className="flex-1 flex flex-col justify-center overflow-hidden p-4 pt-0">
                {drawState === 'idle' && (
                  <div className="space-y-8">
                    {availableParticipants.length < selectedTemplate.slotCount ? (
                      <Alert className="border-cyan-200 bg-white/90">
                        <AlertDescription className="text-center">
                          Not enough eligible participants. Need {selectedTemplate.slotCount}, available {availableParticipants.length}.
                          {cachedSessions.length > 0 && " Please submit existing sessions."}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        {/* Empty slot frames */}
                        <MultiSlotDrawing
                          slots={Array.from({ length: selectedTemplate.slotCount }, (_, i) => ({
                            slotNumber: i + 1,
                            selectedWinnerId: null,
                            animatingParticipantId: null,
                            isRevealed: false,
                          }))}
                          participants={new Map()}
                          isDrawing={false}
                        />
                      </>
                    )}
                  </div>
                )}

                {drawState === 'drawing' && (
                  <MultiSlotDrawing
                    slots={drawSlots}
                    participants={getParticipantsMap()}
                    isDrawing={true}
                  />
                )}

                {drawState === 'revealed' && (
                  <MultiSlotReveal
                    winners={getWinnersArray()}
                    templateName={selectedTemplate.name}
                    onConfirm={handleConfirmWinners}
                    onRedraw={handleRedraw}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Winners Dialog */}
        <Dialog open={showWinnersDialog} onOpenChange={setShowWinnersDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="size-5 text-cyan-600" />
                Pending Sessions & Stats
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Stats Card */}
              <Card className="p-2 border border-cyan-200 bg-white/80 backdrop-blur">
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[10px] font-medium text-muted-foreground">Eligible</p>
                      <p className="text-lg font-bold text-primary">{availableParticipants.length}</p>
                    </div>
                    <div className="text-center border-x border-cyan-200">
                      <p className="text-[10px] font-medium text-muted-foreground">Pending Sessions</p>
                      <p className="text-lg font-bold text-primary">{cachedSessions.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-medium text-muted-foreground">Total Draws</p>
                      <p className="text-lg font-bold text-primary">{drawHistory.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sessions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Pending Sessions</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowWinnersDialog(false)
                      setShowHistoryDialog(true)
                    }}
                    className="border-cyan-300 hover:bg-cyan-50 h-7 text-xs"
                  >
                    <History className="size-3 mr-1" />
                    History ({drawHistory.length})
                  </Button>
                </div>

                {cachedSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No pending sessions yet.<br />
                    <span className="text-xs">Start a draw to select winners.</span>
                  </div>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
                    {cachedSessions.map((session) => (
                      <Card key={session.id} className="border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                        <CardContent className="p-4 space-y-3">
                          {/* Session Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600">
                                  {session.templateName}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {session.slotCount} Winner{session.slotCount > 1 ? 's' : ''}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.createdAt).toLocaleString('en-US', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSession(session.id)}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <X className="size-3" />
                            </Button>
                          </div>

                          {/* Winners in Session */}
                          <div className="grid grid-cols-1 gap-2">
                            {session.winners.map((winner) => (
                              <div
                                key={winner.slotNumber}
                                className="flex items-center gap-2 p-2 bg-white rounded border border-cyan-200"
                              >
                                <Badge variant="secondary" className="shrink-0 text-xs">
                                  #{winner.slotNumber}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-xs truncate">{winner.participant.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {winner.participant.company}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Submit Session Button */}
                          <Button
                            onClick={() => {
                              setShowWinnersDialog(false)
                              handleSubmitSession(session.id)
                            }}
                            size="sm"
                            disabled={submitDrawMutation.isPending}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                          >
                            <Check className="size-3 mr-2" />
                            Submit Session
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="size-5 text-cyan-600" />
                Draw History
              </DialogTitle>
              <DialogDescription>
                Total {drawHistory.length} draw{drawHistory.length > 1 ? 's' : ''} completed
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
                  No draw history yet
                </p>
              ) : (
                <div className="space-y-3">
                  {drawHistory.map((draw, index) => (
                    <Card key={draw.id} className="border border-cyan-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-cyan-100 text-cyan-900">
                                Draw #{drawHistory.length - index}
                              </Badge>
                              {draw.prize_name && (
                                <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600">
                                  {draw.prize_name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(draw.created_at).toLocaleString('en-US', {
                                dateStyle: 'full',
                                timeStyle: 'short'
                              })}
                            </p>
                            {draw.staff && (
                              <p className="text-xs text-muted-foreground">
                                By: {draw.staff.name}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="border-cyan-300">
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

export default StaffDrawPage
