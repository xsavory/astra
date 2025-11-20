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
          className="sm:max-w-lg border border-amber-400/30 shadow-2xl bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950 overflow-hidden"
          showCloseButton={false}
        >
          {/* Subtle background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent" />
          </div>

          <div className="relative text-center space-y-6 py-6">
            {/* VIP Crown Icon with animation */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Subtle glow */}
                <div
                  className={`absolute inset-0 -m-3 rounded-full bg-amber-400/20 blur-xl transition-all duration-1000 ${
                    isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}
                />
                {/* Icon container */}
                <div
                  className={`relative rounded-full bg-gradient-to-br from-amber-500 to-amber-600 p-5 shadow-lg shadow-amber-500/30 transition-all duration-700 ${
                    isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                  }`}
                >
                  <Crown className="size-12 text-white" />
                </div>
                {/* Subtle decorative elements */}
                <Star
                  className={`size-4 text-amber-400/70 absolute -top-2 -right-2 transition-all duration-500 delay-300 ${
                    isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
                <Star
                  className={`size-3 text-amber-400/60 absolute -bottom-1 -left-2 transition-all duration-500 delay-500 ${
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
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
              <h2 className="text-xl font-semibold text-amber-400">
                Welcome, Distinguished Guest
              </h2>
              <p className="text-2xl font-bold text-white tracking-tight">
                {participantName}
              </p>
            </div>

            {/* Welcome text */}
            <p
              className={`text-sm text-slate-400 transition-all duration-500 delay-500 ${
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
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg h-12 text-base"
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
        className="sm:max-w-lg border border-primary/30 shadow-2xl bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 overflow-hidden"
        showCloseButton={false}
      >
        {/* Subtle background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        </div>

        <div className="relative text-center space-y-6 py-6">
          {/* Success Icon with animation */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Subtle glow */}
              <div
                className={`absolute inset-0 -m-3 rounded-full bg-primary/20 blur-xl transition-all duration-1000 ${
                  isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
              />
              {/* Icon container */}
              <div
                className={`relative rounded-full bg-gradient-to-br from-primary to-blue-600 p-5 shadow-lg shadow-primary/30 transition-all duration-700 ${
                  isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                }`}
              >
                <CheckCircle2 className="size-12 text-white" />
              </div>
              {/* Subtle decorative elements */}
              <Sparkles
                className={`size-4 text-primary/70 absolute -top-2 -right-2 transition-all duration-500 delay-300 ${
                  isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
              />
              <Sparkles
                className={`size-3 text-blue-400/60 absolute -bottom-1 -left-2 transition-all duration-500 delay-500 ${
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
            <h2 className="text-xl font-semibold text-primary">
              Check-in Successful
            </h2>
            <p className="text-base text-slate-400">
              Welcome,
            </p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {participantName}
            </p>
          </div>

          {/* Welcome text */}
          <p
            className={`text-sm text-slate-400 transition-all duration-500 delay-500 ${
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
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg h-12 text-base"
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
