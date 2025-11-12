import { useState, useEffect } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { Button } from '@repo/react-components/ui'
import { cn } from '@repo/react-components/lib'
import type { User } from 'src/types/schema'
import { DrawSlotCard } from './draw-slot-card'

interface MultiSlotRevealProps {
  winners: Array<{ slotNumber: number; participant: User }>
  templateName: string
  onConfirm: () => void
  onRedraw: () => void
}

export function MultiSlotReveal({
  winners,
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

  return (
    <div className="space-y-6 w-full">
      {/* Winner Cards */}
      <div
        className={cn(
          `w-full grid gap-2 mx-auto ${getWinnerFontSize(winners.length)} ${getGridColumns(winners.length)}`,
          'transition-all duration-700 delay-300',
        )}
      >
        {winners.map(({ slotNumber, participant }) => (
          <DrawSlotCard
            key={slotNumber}
            participant={participant}
            isAnimating={false}
            isRevealed={true}
          />
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
          Undi Ulang
        </Button>

        <Button
          onClick={onConfirm}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 shadow-lg shadow-white/30"
        >
          <Check className="size-4 mr-2" />
          Konfirmasi Winners
        </Button>
      </div>
    </div>
  )
}
