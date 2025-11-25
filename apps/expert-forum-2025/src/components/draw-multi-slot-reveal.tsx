import { useState, useEffect } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { Button, Badge } from '@repo/react-components/ui'
import { cn } from '@repo/react-components/lib'
import type { User, PrizeInfo } from 'src/types/schema'
import { DrawSlotCard } from './draw-slot-card'

interface MultiSlotRevealProps {
  winners: Array<{
    slotNumber: number
    participant: User
    prizeInfo?: PrizeInfo // Prize info for this winner (online draws)
  }>
  templateName: string
  prizeName?: string // Single prize name for offline draws
  onConfirm: () => void
  onRedraw: () => void
}

export function MultiSlotReveal({
  winners,
  prizeName,
  onConfirm,
  onRedraw,
}: MultiSlotRevealProps) {
  const [isRevealing, setIsRevealing] = useState(false)

  useEffect(() => {
    setIsRevealing(true)
  }, [])

  // Determine grid layout based on winner count
  const getGridColumns = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2'
    return 'grid-cols-3'
  }

  // Determine winner font size based on winner count
  const getWinnerFontSize = (count: number) => {
    if (count === 1) return 'text-5xl'
    if (count === 2) return 'text-4xl'
    if (count <= 6) return 'text-3xl'
    return 'text-xl'
  }

  // Category badge colors for online multi-prize draws
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'grand':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
      case 'major':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'minor':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-6 w-full">
      {/* Single Prize Name (for offline draws) */}
      {prizeName && winners.length === 1 && (
        <div className="text-center">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
            {prizeName}
          </h3>
        </div>
      )}

      {/* Winner Cards */}
      <div
        className={cn(
          `w-full grid gap-6 mx-auto ${getWinnerFontSize(winners.length)} ${getGridColumns(winners.length)}`,
          'transition-all duration-700 delay-300',
        )}
      >
        {winners.map(({ slotNumber, participant, prizeInfo }) => (
          <div key={slotNumber} className="space-y-2">
            {/* Prize name for each winner (for online multi-prize draws) */}
            {prizeInfo && (
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-700">
                  <Badge className={`text-base ${getCategoryColor(prizeInfo.category)}`}>
                    {prizeInfo.prizeName}
                  </Badge>
                </p>
              </div>
            )}

            <DrawSlotCard
              participant={participant}
              isAnimating={false}
              isRevealed={true}
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div
        className={cn(
          'absolute bottom-8 w-full flex gap-3 justify-center transition-all duration-700 delay-500',
          isRevealing ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        <Button
          variant="outline"
          onClick={onRedraw}
          size="lg"
          className="border-2 border-white bg-white/90 hover:bg-white text-primary"
        >
          <RotateCcw className="size-4 mr-2" />
          Redraw
        </Button>

        <Button
          onClick={onConfirm}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-white/30"
        >
          <Check className="size-4 mr-2" />
          Confirm Winners
        </Button>
      </div>
    </div>
  )
}
