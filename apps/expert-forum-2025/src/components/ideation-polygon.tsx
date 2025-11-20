import { Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@repo/react-components/ui'
import type { Ideation, User } from 'src/types/schema'

interface IdeationPolygonProps {
  ideation: (Ideation & { creator?: User; participants?: User[] }) | null
  isRevealed: boolean
  shouldBlink: boolean
  isWinner: boolean
  colorIndex?: number
  isChaos?: boolean
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
  isChaos = false,
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
    if (isEmpty && !isChaos) {
      // Empty (not in chaos) → subtle glass effect with color accent
      cardClasses += ` ${colorVariant.emptyBg} backdrop-blur-sm border ${colorVariant.emptyBorder}`
    } else {
      // Normal filled OR chaos mode (all cards look filled) → futuristic gradient with color variant
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
        'py-2 relative overflow-hidden w-full h-full transition-all duration-500 ease-out bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border-2 border-amber-300 shadow-2xl shadow-amber-400/50 ring-2 ring-amber-300/50'
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
            className={`${iconSize} ${isEmpty && !isChaos ? 'text-primary/30' : 'text-white/90'} drop-shadow-sm`}
          />
        )}

        {/* WINNER DETAIL */}
        {isWinnerRevealed && (
          <div className="flex flex-col h-full w-full px-2">
            {/* Header: Trophy + Ideation Info */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Ideation Title & Company Case - as unified block */}
              <div className="text-center space-y-0.5">
                <h3 className="font-bold text-sm leading-tight tracking-tight text-amber-900 line-clamp-2">
                  {ideation?.title}
                </h3>
                <div className="inline-flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-amber-800/90 bg-amber-100/50 px-1.5 py-0.5 rounded-sm line-clamp-1">
                    {ideation?.company_case}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-amber-700/20 my-1.5" />

            {/* Creator/Team Section */}
            <div className="text-center">
              {ideation?.is_group ? (
                <div className="space-y-0.5">
                  <p className="text-[9px] font-semibold text-amber-700/70 uppercase tracking-wider mb-0.5">
                    Team Members
                  </p>
                  {ideation?.participants?.slice(0, 3).map((p) => (
                    <div key={p.id} className="text-[10px] text-amber-900">
                      <span className="font-semibold line-clamp-1">{p.name}</span>
                      {p.company && (
                        <span className="opacity-70 ml-0.5">• {p.company}</span>
                      )}
                    </div>
                  ))}
                  {(ideation?.participants?.length ?? 0) > 3 && (
                    <div className="text-[9px] text-amber-700/70 font-medium">
                      +{(ideation?.participants?.length ?? 0) - 3} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-[9px] font-semibold text-amber-700/70 uppercase tracking-wider">
                    Created by
                  </p>
                  <div className="text-[11px] text-amber-900">
                    <span className="font-bold line-clamp-1">{ideation?.creator?.name}</span>
                  </div>
                  {ideation?.creator?.company && (
                    <div className="text-[10px] text-amber-800/80 font-medium line-clamp-1">
                      {ideation?.creator?.company}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}

export default IdeationPolygon
