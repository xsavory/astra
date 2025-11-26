import type { DrawSlot, User } from 'src/types/schema'
import { DrawSlotCard } from './draw-slot-card'
import { Badge } from '@repo/react-components/ui'

interface MultiSlotDrawingProps {
  slots: DrawSlot[]
  participants: Map<number, User | null>
  isDrawing: boolean
  prizeName?: string // Single prize name for offline draws
}

export function MultiSlotDrawing({
  slots,
  participants,
  isDrawing,
  prizeName,
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

  // Category badge colors for online multi-prize draws
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'grand':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'major':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'minor':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-6 w-full">
      {/* Single Prize Name (for offline draws) */}
      {prizeName && slots.length === 1 && (
        <div className="text-center">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
            {prizeName}
          </h3>
        </div>
      )}

      <div
        className={`grid gap-2 w-full mx-auto ${getWinnerFontSize(slots.length)} ${getGridColumns(slots.length)}`}
      >
        {slots.map(slot => {
          const participant = participants.get(slot.slotNumber) || null

          return (
            <div key={slot.slotNumber} className="space-y-2">
              {/* Prize name for each slot (for online multi-prize draws) */}
              {slot.prizeInfo && (
                <div className="text-center space-y-1">
                  <p className="font-semibold text-gray-700">
                    <Badge className={`text-base ${getCategoryColor(slot.prizeInfo.category)}`}>
                      {slot.prizeInfo.prizeName}
                    </Badge>
                  </p>
                </div>
              )}

              <DrawSlotCard
                participant={participant}
                isAnimating={isDrawing}
                isRevealed={slot.isRevealed}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
