import { Card, CardContent } from '@repo/react-components/ui'
import { cn } from '@repo/react-components/lib'
import type { User } from 'src/types/schema'

interface DrawSlotCardProps {
  participant: User | null
  isAnimating: boolean
  isRevealed: boolean
}

export function DrawSlotCard({
  participant,
  isAnimating,
  isRevealed,
}: DrawSlotCardProps) {
  // Empty state when idle
  if (!participant && !isAnimating) {
    return (
      <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-2 border-cyan-500 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center space-y-3 min-h-[50px]">
        </CardContent>
      </Card>
    )
  }

  // Animating state
  if (isAnimating && !isRevealed) {
    return (
      <Card
        className={cn(
          'p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-2 border-cyan-500 shadow-lg',
        )}
      >
        <CardContent className="flex flex-col items-center justify-center space-y-3">
          {participant && (
            <div className="text-center space-y-1">
              <p className="font-bold text-white">{participant.name}</p>
              {participant.company && (
                <p className="text-slate-100 text-lg">
                  {participant.company}
                </p>
              )}
              <p className="text-sm text-slate-300">
                {participant.email}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Revealed state
  if (isRevealed && participant) {
    return (
      <Card className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-2 border-cyan-500 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center space-y-3">
          <div className="text-center space-y-1">
            <p className="font-bold text-white">{participant.name}</p>
            {participant.company && (
              <p className="text-slate-100 text-lg">
                {participant.company}
              </p>
            )}
            <p className="text-sm text-slate-300">
              {participant.email}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
