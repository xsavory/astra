import { useEffect, useState } from 'react'
import { CheckCircle2, Sparkles, Crown, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  Button,
} from '@repo/react-components/ui'

interface CheckinGreetingAnimationProps {
  open: boolean
  participantName: string
  isVIP?: boolean
  onOpenChange?: (open: boolean) => void
  duration?: number // in milliseconds (kept for backward compatibility, but not used for auto-close)
}

function CheckinGreetingAnimation({
  open,
  participantName,
  isVIP = false,
  onOpenChange,
}: CheckinGreetingAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (open) {
      // Trigger animation on open
      setIsAnimating(true)
    } else {
      setIsAnimating(false)
    }
  }, [open])

  const handleConfirm = () => {
    setIsAnimating(false)
    // Close dialog after brief fade-out
    setTimeout(() => {
      onOpenChange?.(false)
    }, 150)
  }

  // VIP Greeting Component
  if (isVIP) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-lg border-2 border-white/30 shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary via-blue-600 to-cyan-500 overflow-hidden"
          showCloseButton={false}
        >
          <div className="relative text-center space-y-6 py-6">
            {/* VIP Crown Icon with animation */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Subtle glow */}
                <div
                  className={`absolute inset-0 -m-3 rounded-full bg-amber-400/30 blur-xl transition-all duration-1000 ${
                    isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}
                />
                {/* Icon container */}
                <div
                  className={`relative rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 p-5 shadow-lg shadow-amber-500/50 transition-all duration-700 ${
                    isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                  }`}
                >
                  <Crown className="size-12 text-white" />
                </div>
                {/* Subtle decorative elements */}
                <Star
                  className={`size-4 text-amber-300 absolute -top-2 -right-2 transition-all duration-500 delay-300 ${
                    isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
                <Star
                  className={`size-3 text-yellow-300 absolute -bottom-1 -left-2 transition-all duration-500 delay-500 ${
                    isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
              </div>
            </div>

            {/* VIP Badge */}
            <div
              className={`transition-all duration-500 delay-200 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-semibold tracking-wide">
                <Crown className="size-3" />
                VIP GUEST
              </span>
            </div>

            {/* Success Message */}
            <div
              className={`space-y-3 transition-all duration-500 delay-300 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <h2 className="text-xl font-semibold text-amber-300">
                Welcome, Distinguished Guest
              </h2>
              <p className="text-2xl font-bold text-white tracking-tight">
                {participantName}
              </p>
            </div>

            {/* Welcome text */}
            <p
              className={`text-sm text-white/70 transition-all duration-500 delay-500 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              We are honored to have you at Expert Forum 2025
            </p>

            {/* CTA Button */}
            <div
              className={`pt-2 transition-all duration-500 delay-700 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <Button
                onClick={handleConfirm}
                size="lg"
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold shadow-lg h-12 text-base"
              >
                <CheckCircle2 className="mr-2 size-5" />
                Confirm Check-in
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Regular Greeting Component
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg border-2 border-white/30 shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary via-blue-600 to-cyan-500 overflow-hidden"
        showCloseButton={false}
      >
        <div className="relative text-center space-y-6 py-6">
          {/* Success Icon with animation */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Subtle glow */}
              <div
                className={`absolute inset-0 -m-3 rounded-full bg-white/20 blur-xl transition-all duration-1000 ${
                  isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
              />
              {/* Icon container */}
              <div
                className={`relative rounded-full bg-white/20 backdrop-blur-sm p-5 shadow-lg transition-all duration-700 ${
                  isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                }`}
              >
                <CheckCircle2 className="size-12 text-white" />
              </div>
              {/* Subtle decorative elements */}
              <Sparkles
                className={`size-4 text-white/70 absolute -top-2 -right-2 transition-all duration-500 delay-300 ${
                  isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
              />
              <Sparkles
                className={`size-3 text-cyan-200 absolute -bottom-1 -left-2 transition-all duration-500 delay-500 ${
                  isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
              />
            </div>
          </div>

          {/* Success Message */}
          <div
            className={`space-y-3 transition-all duration-500 delay-300 ${
              isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <h2 className="text-xl font-semibold text-white">
              Check-in Successful
            </h2>
            <p className="text-base text-white/70">
              Welcome,
            </p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {participantName}
            </p>
          </div>

          {/* Welcome text */}
          <p
            className={`text-sm text-white/70 transition-all duration-500 delay-500 ${
              isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Enjoy the Expert Forum 2025 event
          </p>

          {/* CTA Button */}
          <div
            className={`pt-2 transition-all duration-500 delay-700 ${
              isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <Button
              onClick={handleConfirm}
              size="lg"
              className="w-full bg-white hover:bg-white/90 text-primary font-semibold shadow-lg h-12 text-base"
            >
              <CheckCircle2 className="mr-2 size-5" />
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CheckinGreetingAnimation
