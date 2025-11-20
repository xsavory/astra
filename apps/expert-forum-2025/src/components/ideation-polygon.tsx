import { Lightbulb, Trophy } from 'lucide-react'
import { Card, CardContent } from '@repo/react-components/ui'
import type { Ideation, User } from 'src/types/schema'

interface IdeationPolygonProps {
  ideation: (Ideation & { creator?: User; participants?: User[] }) | null
  isRevealed: boolean
  shouldBlink: boolean
  isWinner: boolean
  colorIndex?: number
}

// Color palette - variations of blue for professional look
const COLOR_VARIANTS = [
  { from: 'from-blue-500', via: 'via-blue-600', to: 'to-blue-700', glow: 'shadow-blue-500/30', ring: 'ring-blue-400/60', border: 'border-blue-400/30', emptyBg: 'bg-blue-500/5', emptyBorder: 'border-blue-400/10' },
  { from: 'from-sky-500', via: 'via-sky-600', to: 'to-blue-600', glow: 'shadow-sky-500/30', ring: 'ring-sky-400/60', border: 'border-sky-400/30', emptyBg: 'bg-sky-500/5', emptyBorder: 'border-sky-400/10' },
  { from: 'from-cyan-500', via: 'via-cyan-600', to: 'to-blue-600', glow: 'shadow-cyan-500/30', ring: 'ring-cyan-400/60', border: 'border-cyan-400/30', emptyBg: 'bg-cyan-500/5', emptyBorder: 'border-cyan-400/10' },
  { from: 'from-indigo-500', via: 'via-indigo-600', to: 'to-blue-700', glow: 'shadow-indigo-500/30', ring: 'ring-indigo-400/60', border: 'border-indigo-400/30', emptyBg: 'bg-indigo-500/5', emptyBorder: 'border-indigo-400/10' },
  { from: 'from-blue-600', via: 'via-blue-700', to: 'to-indigo-700', glow: 'shadow-blue-600/30', ring: 'ring-blue-500/60', border: 'border-blue-500/30', emptyBg: 'bg-blue-600/5', emptyBorder: 'border-blue-500/10' },
  { from: 'from-sky-600', via: 'via-blue-600', to: 'to-indigo-600', glow: 'shadow-sky-600/30', ring: 'ring-sky-500/60', border: 'border-sky-500/30', emptyBg: 'bg-sky-600/5', emptyBorder: 'border-sky-500/10' },
  { from: 'from-cyan-600', via: 'via-sky-600', to: 'to-blue-600', glow: 'shadow-cyan-600/30', ring: 'ring-cyan-500/60', border: 'border-cyan-500/30', emptyBg: 'bg-cyan-600/5', emptyBorder: 'border-cyan-500/10' },
  { from: 'from-blue-400', via: 'via-sky-500', to: 'to-cyan-600', glow: 'shadow-blue-400/30', ring: 'ring-blue-300/60', border: 'border-blue-300/30', emptyBg: 'bg-blue-400/5', emptyBorder: 'border-blue-300/10' },
]

export function IdeationPolygon({
  ideation,
  isRevealed,
  shouldBlink,
  isWinner,
  colorIndex = 0,
}: IdeationPolygonProps) {

  const isEmpty = !ideation
  const isNormalFilled = ideation && !isRevealed
  const isWinnerRevealed = ideation && isRevealed && isWinner

  // Get color variant based on index
  const colorVariant = COLOR_VARIANTS[colorIndex % COLOR_VARIANTS.length]!

  /** BASE CLASS */
  let cardClasses = 'relative overflow-hidden w-full h-full transition-all duration-300 ease-out'

  /** -----------------------------------------------
   *  1) BELUM REVEAL
   * ----------------------------------------------- */
  if (!isRevealed) {
    if (isEmpty) {
      // Empty → subtle glass effect with color accent
      cardClasses += ` ${colorVariant.emptyBg} backdrop-blur-sm border ${colorVariant.emptyBorder}`
    } else {
      // Normal filled → futuristic gradient with color variant
      cardClasses += ` bg-gradient-to-br ${colorVariant.from} ${colorVariant.via} ${colorVariant.to} border ${colorVariant.border} shadow-lg ${colorVariant.glow}`

      if (shouldBlink) {
        cardClasses += ` animate-pulse ring-2 ${colorVariant.ring} shadow-xl`
      }
    }
  }

  /** -----------------------------------------------
   *  2) REVEAL STATE
   * ----------------------------------------------- */
  if (isRevealed) {
    if (isWinnerRevealed) {
      // Winner card → premium gold with glow
      cardClasses =
        'relative overflow-hidden w-full h-full transition-all duration-500 ease-out bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border-2 border-amber-300 shadow-2xl shadow-amber-400/50 ring-2 ring-amber-300/50'
    } else {
      // Non-winner OR empty → dimmed with color variant
      cardClasses += ` bg-gradient-to-br ${colorVariant.from} ${colorVariant.to} border ${colorVariant.border} opacity-70`
    }
  }

  const iconSize = isRevealed ? 'h-8 w-8' : 'h-5 w-5'

  return (
    <Card className={cardClasses}>
      {/* Subtle grid pattern overlay for futuristic feel */}
      {!isEmpty && !isWinnerRevealed && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      )}

      {/* Glow accent for filled cards */}
      {isNormalFilled && (
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Winner shimmer effect */}
      {isWinnerRevealed && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
      )}

      <CardContent className="flex flex-col items-center justify-center h-full gap-1 relative z-10 p-2">

        {/* NON-WINNER during reveal OR EMPTY OR NORMAL → icon only */}
        {(isEmpty || isNormalFilled || (isRevealed && !isWinner)) && (
          <Lightbulb
            className={`${iconSize} ${isEmpty ? 'text-primary/30' : 'text-white/90'} drop-shadow-sm`}
          />
        )}

        {/* WINNER DETAIL */}
        {isWinnerRevealed && (
          <div className="text-center space-y-1.5 w-full px-1">
            {/* Trophy icon */}
            <div className="flex justify-center">
              <Trophy className="h-6 w-6 text-amber-700 drop-shadow-md" />
            </div>

            <div className="space-y-1 text-amber-900">
              <h3 className="font-bold text-sm line-clamp-2 leading-tight tracking-tight">
                {ideation?.title}
              </h3>

              <p className="text-xs font-medium opacity-80 line-clamp-1">
                {ideation?.company_case}
              </p>

              <div className="text-[10px] font-medium pt-1.5 border-t border-amber-700/20">
                {ideation?.is_group ? (
                  <div className="space-y-0.5">
                    {ideation?.participants?.slice(0, 3).map((p) => (
                      <div key={p.id} className="line-clamp-1 opacity-90">
                        {p.name}
                      </div>
                    ))}
                    {(ideation?.participants?.length ?? 0) > 3 && (
                      <div className="opacity-70">
                        +{(ideation?.participants?.length ?? 0) - 3} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="line-clamp-1 opacity-90">
                    {ideation?.creator?.name}
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
