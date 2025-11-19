import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import PageLoader from 'src/components/page-loader'
import api from 'src/lib/api'
import AppButton from 'src/components/app-button'
import IdeationPolygon from 'src/components/ideation-polygon'

import bgImage from 'src/assets/background.png'
import logoHeadline from 'src/assets/logo-headline.png'

import type { Ideation, User } from 'src/types/schema'

export const Route = createFileRoute('/staff/ideation')({
  component: StaffIdeationPage,
  pendingComponent: PageLoader,
})

function StaffIdeationPage() {
  const [isRevealed, setIsRevealed] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set())

  // Fetch ALL ideations with creator and participant details (no limit)
  const {
    data: ideationsData = [],
    isLoading,
    refetch,
  } = useQuery<Array<Ideation & { creator: User; participants?: User[] }>>({
    queryKey: ['staff-ideations'],
    queryFn: async () => {
      // Fetch all ideations without limit
      return await api.ideations.getIdeationsForStaffDisplay(100)
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  // Subscribe to realtime ideation changes
  useEffect(() => {
    const unsubscribe = api.ideations.subscribeToIdeations((newIdeation) => {
      console.log('New ideation received:', newIdeation)

      // Add to recently added set for blink effect
      if (newIdeation.id) {
        setRecentlyAdded((prev) => new Set(prev).add(newIdeation.id))

        // Remove from recently added after 3 seconds
        setTimeout(() => {
          setRecentlyAdded((prev) => {
            const updated = new Set(prev)
            updated.delete(newIdeation.id)
            return updated
          })
        }, 3000)
      }

      // Refetch ideations
      refetch()
    })

    return () => {
      unsubscribe()
    }
  }, [refetch])

  // Hardcoded grid configuration
  const NORMAL_COLS = 14
  const NORMAL_ROWS = 6
  const NORMAL_TOTAL = NORMAL_COLS * NORMAL_ROWS // 192 shapes

  const REVEAL_COLS = 4
  const REVEAL_ROWS = 3
  const REVEAL_TOTAL = REVEAL_COLS * REVEAL_ROWS // 12 shapes

  // Prepare display data with empty slots
  const displayData = useMemo(() => {
    if (isRevealed) {
      // Show only winners when revealed (max 12)
      const winners = ideationsData.filter((ideation) => ideation.is_winner)
      return winners.slice(0, REVEAL_TOTAL)
    }

    // Show all ideations + empty slots to fill 192 total
    const filled = ideationsData.slice(0, NORMAL_TOTAL)
    const emptyCount = NORMAL_TOTAL - filled.length
    const empty = Array(emptyCount).fill(null)

    return [...filled, ...empty]
  }, [ideationsData, isRevealed, NORMAL_TOTAL, REVEAL_TOTAL])

  // Grid configuration based on reveal state
  const gridConfig = useMemo(() => {
    if (isRevealed) {
      return {
        cols: REVEAL_COLS,
        rows: REVEAL_ROWS,
        gap: 'gap-4',
      }
    }

    return {
      cols: NORMAL_COLS,
      rows: NORMAL_ROWS,
      gap: 'gap-2',
    }
  }, [isRevealed])

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="min-w-screen min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Background"
          className="h-full w-full object-cover"
        />
      </div>
        <AppButton
          onClick={() => setIsRevealed(!isRevealed)}
          className="absolute top-4 left-4 z-50"
        >
          {isRevealed ? (
            <>
              <EyeOff className="h-4 w-4" />
              Hide Winners
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Reveal Winners
            </>
          )}
        </AppButton>

      <div className="relative p-6 h-screen flex flex-col">
        {/* Header Section */}

        <div className="flex justify-center shrink-0">
          <img
            src={logoHeadline}
            alt="The 9th Expert Forum"
            className="h-auto w-full max-w-[250px]"
          />
        </div>

        {/* Main Content - Polygon Grid (No Scroll) */}
        <div className="flex-1 flex items-center justify-center overflow-hidden w-full p-4">
          <div
            className={`grid ${gridConfig.gap} transition-all duration-700 ease-in-out w-full h-full`}
            style={{
              gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
              gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
            }}
          >
            {displayData.map((ideation, index) => (
              <div
                key={ideation?.id || `empty-${index}`}
                className="transition-all duration-700 ease-in-out aspect-square"
              >
                <IdeationPolygon
                  ideation={ideation}
                  isRevealed={isRevealed}
                  shouldBlink={ideation?.id ? recentlyAdded.has(ideation.id) : false}
                  isWinner={ideation?.is_winner || false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffIdeationPage