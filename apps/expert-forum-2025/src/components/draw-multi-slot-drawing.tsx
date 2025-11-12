import type { DrawSlot, User } from 'src/types/schema'
import { DrawSlotCard } from './draw-slot-card'

interface MultiSlotDrawingProps {
  slots: DrawSlot[]
  participants: Map<number, User | null>
  isDrawing: boolean
}

export function MultiSlotDrawing({
  slots,
  participants,
  isDrawing,
}: MultiSlotDrawingProps) {
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
      <div
        className={`grid gap-2 w-full mx-auto ${getWinnerFontSize(slots.length)} ${getGridColumns(slots.length)}`}
      >
        {slots.map(slot => {
          const participant = participants.get(slot.slotNumber) || null

          return (
            <DrawSlotCard
              key={slot.slotNumber}
              participant={participant}
              isAnimating={isDrawing}
              isRevealed={slot.isRevealed}
            />
          )
        })}
      </div>
    </div>
  )
}
