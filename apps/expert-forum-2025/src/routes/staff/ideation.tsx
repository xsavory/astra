import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout'

import PageLoader from 'src/components/page-loader'
import api from 'src/lib/api'
import AppButton from 'src/components/app-button'
import IdeationPolygon from 'src/components/ideation-polygon'

import bgImage from 'src/assets/background.png'
import logoHeadline from 'src/assets/logo-headline.png'

import type { Ideation, User } from 'src/types/schema'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

/* GRID */
const COLS = 14
const ROWS = 6
const TOTAL = COLS * ROWS

/* Winner reveal list grid */
const WIN_LIST_COLS = 4
const WIN_LIST_ROWS = 3
const WIN_LIST_TOTAL = WIN_LIST_COLS * WIN_LIST_ROWS

const ResponsiveGridLayout = WidthProvider(Responsive)

export const Route = createFileRoute('/staff/ideation')({
  component: StaffIdeationPage,
  pendingComponent: PageLoader,
})

function StaffIdeationPage() {
  const [isRevealed, setIsRevealed] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'chaos' | 'collapse' | 'revealStage' | 'revealList'>('idle')
  const [chaosTick, setChaosTick] = useState(0)
  const [activeCount, setActiveCount] = useState(TOTAL)
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set())

  const { data: ideationsData = [], isLoading, refetch } =
    useQuery<Array<Ideation & { creator: User; participants?: User[] }>>({
      queryKey: ['staff-ideations'],
      queryFn: async () => await api.ideations.getIdeationsForStaffDisplay(200),
      refetchInterval: 10000,
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

  const dynamicCols = useMemo(() => {
    if (phase !== 'chaos') return COLS

    if (activeCount > 100) return 14
    if (activeCount > 70) return 12
    if (activeCount > 50) return 10
    if (activeCount > 30) return 8
    if (activeCount > 15) return 6
    return 4
  }, [phase, activeCount])

  /* displayData used for RGL phases (normal, chaos, collapse) */
  const displayData = useMemo(() => {
    const sliced = ideationsData.slice(0, activeCount)
    const empty = Array(Math.max(0, activeCount - sliced.length)).fill(null)
    return [...sliced, ...empty] as Array<Ideation | null>
  }, [ideationsData, activeCount])

  /* build layout depending on phase */
  const layouts = useMemo(() => {
    // CHAOS: random 1x1 positions
    if (phase === 'chaos') {
      const allCells: { x: number; y: number }[] = []
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          allCells.push({ x, y })
        }
      }
      const cells = allCells.slice()
      // quick shuffles based on chaosTick to vary order
      for (let s = 0; s < (chaosTick % 6) + 1; s++) {
        for (let i = cells.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[cells[i], cells[j]] = [cells[j]!, cells[i]!]
        }
      }

      const layout: Layout[] = []
      for (let i = 0; i < activeCount; i++) {
        const cell = cells[i % cells.length]!
        layout.push({ i: `${i}`, x: cell.x % dynamicCols, y: Math.floor(cell.x / dynamicCols), w: 1, h: 1, static: true })
      }
      return { lg: layout }
    }

    // COLLAPSE / NORMAL while not revealed: row-major for activeCount
    if (phase === 'collapse' || phase === 'idle') {
      const normal: Layout[] = []
      for (let i = 0; i < activeCount; i++) {
        normal.push({ i: `${i}`, x: i % dynamicCols, y: Math.floor(i / COLS), w: 1, h: 1, static: true })
      }
      return { lg: normal }
    }

    // revealStage: we'll collapse grid fully (no RGL winners) — keep layout full empty to aid transition
    if (phase === 'revealStage') {
      // keep layout as full grid but empty items count = 0 so RGL has nothing to render
      return { lg: [] }
    }

    // fallback: full grid
    const fallback: Layout[] = []
    for (let i = 0; i < TOTAL; i++) fallback.push({ i: `${i}`, x: i % dynamicCols, y: Math.floor(i / dynamicCols), w: 1, h: 1, static: true })
    return { lg: fallback }
  }, [phase, chaosTick, activeCount, dynamicCols])

  /* run chaos by regenerating RGL layout several times */
  const runChaos = async () => {
    setPhase('chaos')

    const shrinkSteps = [
      Math.floor(TOTAL * 0.98),
      Math.floor(TOTAL * 0.96),
      Math.floor(TOTAL * 0.94),
      Math.floor(TOTAL * 0.92),
      Math.floor(TOTAL * 0.90),
      Math.floor(TOTAL * 0.87),
      Math.floor(TOTAL * 0.84),
      Math.floor(TOTAL * 0.80),
      Math.floor(TOTAL * 0.75),
      Math.floor(TOTAL * 0.70),
      Math.floor(TOTAL * 0.62),
      Math.floor(TOTAL * 0.55),
      Math.floor(TOTAL * 0.48),
      Math.floor(TOTAL * 0.42),
      Math.floor(TOTAL * 0.36),
      Math.floor(TOTAL * 0.30),
      Math.floor(TOTAL * 0.24),
      Math.floor(TOTAL * 0.18),
      Math.floor(TOTAL * 0.12),
      Math.floor(TOTAL * 0.08),
      0,
    ]


    for (let i = 0; i < shrinkSteps.length; i++) {
      setChaosTick((s) => s + 1)
      setActiveCount(shrinkSteps[i] as number)

      // biar scramble terasa
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  /* reveal winners list: after collapse we show winners in a separate layout */
  const [revealWinners, setRevealWinners] = useState<Array<Ideation & { creator?: User; participants?: User[] }>>([])
  const [showWinnerList, setShowWinnerList] = useState(false)
  const [winnerAnimReady, setWinnerAnimReady] = useState(false)

  const prepareWinners = () => {
    const winners = ideationsData.filter((d) => d.is_winner).slice(0, WIN_LIST_TOTAL)
    setRevealWinners(winners)
  }

  const triggerReveal = async () => {
    if (!isRevealed) {
      await runChaos()

      // langsung masuk winners, tanpa delay kosong
      prepareWinners()
      setWinnerAnimReady(false)  // reset sebelum tampil

      setShowWinnerList(true)
      setPhase('revealList')
      setIsRevealed(true)

      setTimeout(() => {
        setWinnerAnimReady(true)
      }, 50) 
    } else {
      // reset
      setShowWinnerList(false)
      setRevealWinners([])
      setActiveCount(TOTAL)
      setPhase('idle')
      setIsRevealed(false)
    }
  }


  if (isLoading) return <PageLoader />

  /* card style during RGL phases (simple) */
  const getRGLCardStyle = (_d: Ideation | null): React.CSSProperties => ({
    transitionProperty: 'transform, opacity',
    transitionDuration: '180ms',
    transitionTimingFunction: 'ease',
    transform: 'scale(1)',
    opacity: 1,
  })

  /* winner list styles: zoom + fade-in sequence handled via CSS variables */
  const winnerItemStyle = (index: number): React.CSSProperties => ({
    transitionProperty: 'transform, opacity',
    transitionDuration: '420ms',
    transitionTimingFunction: 'cubic-bezier(.2,.9,.2,1)',
    transitionDelay: `${index * 120}ms`,
    transform: showWinnerList && winnerAnimReady ? 'scale(1)' : 'scale(0.7)',
    opacity: showWinnerList && winnerAnimReady ? 1 : 0,
  })

  return (
    <div className="min-w-screen min-h-screen relative overflow-hidden">
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

      <div className="relative p-6 h-screen flex flex-col">
        <div className="flex justify-center shrink-0">
          <img src={logoHeadline} alt="Headline" className="h-auto w-full max-w-[250px]" />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex items-center justify-center overflow-hidden w-full">
          <div className="w-full max-w-[1500px]">

            {/* RGL stage: normal / chaos / collapse (shown while not in revealList) */}
            {phase !== 'revealList' && (
              <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 992, sm: 768, xs: 480 }}
                cols={{ lg: dynamicCols, md: dynamicCols, sm: dynamicCols, xs: dynamicCols }}
                rowHeight={90}
                margin={[8, 8]}
                isDraggable={false}
                isResizable={false}
                compactType={null}
              >
                {displayData.map((d, idx) => (
                  <div key={String(idx)}>
                    <div className="w-full h-full" style={getRGLCardStyle(d)}>
                      <IdeationPolygon
                        ideation={d}
                        isRevealed={false}
                        shouldBlink={d?.id ? recentlyAdded.has(d.id) : false}
                        isWinner={d?.is_winner || false}
                        colorIndex={idx}
                      />
                    </div>
                  </div>
                ))}
              </ResponsiveGridLayout>
            )}

            {/* Reveal List stage: big winners only */}
            {phase === 'revealList' && (
              <div className="w-full flex items-center justify-center">
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${WIN_LIST_COLS}, minmax(0, 1fr))`,
                    width: '100%',
                    maxWidth: 1200,
                    padding: 8,
                  }}
                >
                  {Array.from({ length: WIN_LIST_TOTAL }).map((_, i) => {
                    const ide = revealWinners[i] ?? null
                    return (
                      <div key={i} style={{ height: 180 }}>
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
