import { Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@repo/react-components/ui'
import type { Ideation, User } from 'src/types/schema'

interface IdeationPolygonProps {
  ideation: (Ideation & { creator?: User; participants?: User[] }) | null
  isRevealed: boolean
  shouldBlink: boolean
  isWinner: boolean
}

export function IdeationPolygon({
  ideation,
  isRevealed,
  shouldBlink,
  isWinner,
}: IdeationPolygonProps) {
  // Determine styling based on state
  const isEmpty = !ideation
  const isFilledNormal = ideation && !isRevealed
  const isRevealedWinner = ideation && isRevealed && isWinner

  // Base classes - removed fixed aspect ratio for dynamic sizing
  let cardClasses = 'relative overflow-hidden transition-all duration-700 ease-in-out w-full h-full'

  // Empty/dim state (no data)
  if (isEmpty) {
    cardClasses += ' bg-secondary border border-amber-600/10'
  }
  // Normal filled state (not revealed)
  else if (isFilledNormal) {
    cardClasses += ' bg-primary border-2 border-amber-400'

    // Add blink effect for newly added
    if (shouldBlink) {
      cardClasses += ' animate-pulse ring-4 ring-amber-400/50'
    }
  }
  // Revealed winner state
  else if (isRevealedWinner) {
    cardClasses += ' bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border-4 border-amber-500 shadow-2xl shadow-amber-500/50'
  }

  // Determine icon size based on reveal state
  const iconSize = isRevealed ? 'h-8 w-8' : 'h-6 w-6'

  return (
    <Card
      className={cardClasses}
      style={{
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
      }}
    >
      <CardContent className="flex flex-col items-center justify-center h-full p-1 gap-0.5">
        {isEmpty ? (
          // Empty/dim state: Show very faint lightbulb
          <Lightbulb className={`${iconSize} text-primary/20`} />
        ) : !isRevealed ? (
          // Normal filled state: Just show lightbulb icon
          <Lightbulb className={`${iconSize} text-white`} />
        ) : (
          // Revealed state: Show full details
          <div className="text-center space-y-1 w-full px-2">
            <Lightbulb className={`${iconSize} mx-auto ${isWinner ? 'text-amber-900' : 'text-white'}`} />

            <div className={`space-y-0.5 ${isWinner ? 'text-amber-900' : 'text-white'}`}>
              <h3 className="font-bold text-sm line-clamp-2 leading-tight">
                {ideation.title}
              </h3>

              <p className="text-xs opacity-90 line-clamp-1">
                {ideation.company_case}
              </p>

              <div className="text-xs font-medium pt-1 border-t border-current/20">
                {ideation.is_group ? (
                  // Group ideation: Show all members
                  <div className="space-y-0.5">
                    {ideation.participants?.map((participant) => (
                      <div key={participant.id} className="line-clamp-1">
                        {participant.name} ({participant.company})
                      </div>
                    ))}
                  </div>
                ) : (
                  // Individual ideation: Show creator
                  <div className="line-clamp-1">
                    {ideation.creator?.name} ({ideation.creator?.company})
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default IdeationPolygon
