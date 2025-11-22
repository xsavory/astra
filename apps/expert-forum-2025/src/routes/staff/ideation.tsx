import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import PageLoader from 'src/components/page-loader'
import api from 'src/lib/api'
import AppButton from 'src/components/app-button'
import IdeationPolygon from 'src/components/ideation-polygon'

import bgImage from 'src/assets/background.webp'
import logoHeadline from 'src/assets/logo-headline.png'

import type { Ideation, User } from 'src/types/schema'

/* Idle state grid */
const IDLE_COLS = 14
const IDLE_ROWS = 7
const IDLE_TOTAL = IDLE_COLS * IDLE_ROWS

/* Winner reveal list grid - 50 winners in 10x5 grid */
const WIN_LIST_COLS = 5
const WIN_LIST_ROWS = 10
const WIN_LIST_TOTAL = WIN_LIST_COLS * WIN_LIST_ROWS

export const Route = createFileRoute('/staff/ideation')({
  component: StaffIdeationPage,
  pendingComponent: PageLoader,
})

function StaffIdeationPage() {
  const [isRevealed, setIsRevealed] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set())

  // TODO: Remove mock data and restore API call
  const { data: ideationsData = [], isLoading, refetch } =
    useQuery<Array<Ideation & { creator: User; participants?: User[] }>>({
      queryKey: ['staff-ideations'],
      queryFn: async () => {
        return await api.ideations.getIdeationsForStaffDisplay(200)
      },
      refetchInterval: 15000, // refetch every 15s
    })

  useEffect(() => {
    const unsub = api.ideations.subscribeToIdeations((newIdeation) => {
      if (newIdeation?.id) {
        setRecentlyAdded((prev) => new Set(prev).add(newIdeation.id))
        setTimeout(() => {
          setRecentlyAdded((prev) => {
            const u = new Set(prev)
            u.delete(newIdeation.id)
            return u
          })
        }, 3000)
      }
      refetch()
    })
    return () => unsub()
  }, [refetch])

  /* displayData for idle state grid */
  const displayData = (() => {
    const sliced = ideationsData.slice(0, IDLE_TOTAL)
    const empty = Array(Math.max(0, IDLE_TOTAL - sliced.length)).fill(null)
    return [...sliced, ...empty] as Array<(Ideation & { creator?: User; participants?: User[] }) | null>
  })()

  /* reveal winners list */
  const [revealWinners, setRevealWinners] = useState<Array<Ideation & { creator?: User; participants?: User[] }>>([])
  const [showWinnerList, setShowWinnerList] = useState(false)
  const [winnerAnimReady, setWinnerAnimReady] = useState(false)

  const prepareWinners = () => {
    const winners = ideationsData.filter((d) => d.is_winner).slice(0, WIN_LIST_TOTAL)
    setRevealWinners(winners)
  }

  const triggerReveal = async () => {
    if (!isRevealed) {
      prepareWinners()
      setWinnerAnimReady(false)

      setShowWinnerList(true)
      setIsRevealed(true)

      setTimeout(() => {
        setWinnerAnimReady(true)
      }, 150)
    } else {
      // reset
      setShowWinnerList(false)
      setRevealWinners([])
      setIsRevealed(false)
    }
  }

  if (isLoading) return <PageLoader />

  /* winner list styles: zoom + fade-in sequence */
  const winnerItemStyle = (index: number): React.CSSProperties => ({
    transitionProperty: 'transform, opacity',
    transitionDuration: '350ms',
    transitionTimingFunction: 'cubic-bezier(.2,.9,.2,1)',
    transitionDelay: `${index * 60}ms`,
    transform: showWinnerList && winnerAnimReady ? 'scale(1)' : 'scale(0.7)',
    opacity: showWinnerList && winnerAnimReady ? 1 : 0,
  })

  return (
    <div className="min-w-screen min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt="BG" className="h-full w-full object-cover" />
      </div>

      <AppButton onClick={triggerReveal} className="absolute top-4 left-4 z-50">
        {isRevealed ? (
          <>
            <EyeOff className="h-4 w-4" /> Hide Winners
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" /> Reveal Winners
          </>
        )}
      </AppButton>

      <div className="relative p-4 h-screen flex flex-col">
        <div className="flex justify-center shrink-0">
          <img src={logoHeadline} alt="Headline" className="h-auto w-full max-w-[200px] mb-4" />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex justify-center w-full">
          <div className="w-full max-w-[1600px]">

            {/* Idle state - show all ideation cards */}
            {!isRevealed && (
              <div className="w-full flex items-center justify-center">
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${IDLE_COLS}, minmax(0, 1fr))`,
                    width: '100%',
                  }}
                >
                  {displayData.map((d, idx) => (
                    <div key={idx} style={{ height: 90 }}>
                      <div className="w-full h-full">
                        <IdeationPolygon
                          ideation={d}
                          isRevealed={false}
                          shouldBlink={d?.id ? recentlyAdded.has(d.id) : false}
                          isWinner={d?.is_winner || false}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Winner List - 50 cards in 10x5 grid */}
            {isRevealed && (
              <div className="w-full flex items-center justify-center">
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${WIN_LIST_COLS}, minmax(0, auto))`,
                    width: '100%',
                  }}
                >
                  {Array.from({ length: WIN_LIST_TOTAL }).map((_, i) => {
                    const ide = revealWinners[i] ?? null
                    return (
                      <div key={i}>
                        <div
                          style={{
                            ...winnerItemStyle(i),
                            willChange: "opacity, transform",
                          }}
                          className="w-full h-full">
                          {ide ? (
                            <div className="w-full h-full">
                              <IdeationPolygon
                                ideation={ide}
                                isRevealed={true}
                                shouldBlink={false}
                                isWinner={true}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-transparent" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffIdeationPage
