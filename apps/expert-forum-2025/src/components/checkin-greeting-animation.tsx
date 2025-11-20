import { useEffect, useState } from 'react'
import { CheckCircle2, Sparkles, Crown, Star, Zap } from 'lucide-react'
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
          className="sm:max-w-lg border-2 border-amber-400/50 shadow-2xl shadow-amber-500/20 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 overflow-hidden"
          showCloseButton={false}
        >
          {/* Animated background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
            {/* Glowing orbs */}
            <div className="absolute -top-20 -left-20 size-40 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -right-20 size-40 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            {/* Scan lines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(251,191,36,0.02)_50%)] bg-[size:100%_4px] animate-pulse" />
          </div>

          <div className="relative text-center space-y-6 py-6">
            {/* VIP Crown Icon with animation */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Glowing ring */}
                <div
                  className={`absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-xl transition-all duration-1000 ${
                    isAnimating ? 'opacity-60 scale-100' : 'opacity-0 scale-50'
                  }`}
                />
                {/* Icon container */}
                <div
                  className={`relative rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 p-5 shadow-lg shadow-amber-500/50 transition-all duration-700 ${
                    isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                  }`}
                >
                  <Crown className="size-12 text-slate-900" />
                </div>
                {/* Decorative elements */}
                <Star
                  className={`size-5 text-amber-400 absolute -top-3 -right-3 transition-all duration-500 delay-300 ${
                    isAnimating ? 'opacity-100 scale-100 animate-pulse' : 'opacity-0 scale-0'
                  }`}
                />
                <Star
                  className={`size-4 text-yellow-400 absolute -top-1 -left-4 transition-all duration-500 delay-500 ${
                    isAnimating ? 'opacity-100 scale-100 animate-pulse' : 'opacity-0 scale-0'
                  }`}
                />
                <Zap
                  className={`size-5 text-amber-300 absolute -bottom-2 -right-4 transition-all duration-500 delay-700 ${
                    isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
                <Sparkles
                  className={`size-4 text-yellow-300 absolute -bottom-3 -left-3 transition-all duration-500 delay-400 ${
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
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 text-amber-400 text-sm font-bold tracking-wider">
                <Crown className="size-3.5" />
                VIP GUEST
              </span>
            </div>

            {/* Success Message */}
            <div
              className={`space-y-3 transition-all duration-500 delay-300 ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Welcome, Distinguished Guest
              </h2>
              <p className="text-3xl font-bold text-white tracking-tight">
                {participantName}
              </p>
            </div>

            {/* Welcome text */}
            <p
              className={`text-sm text-amber-200/70 transition-all duration-500 delay-500 ${
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
                className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-slate-900 font-bold shadow-lg shadow-amber-500/30 border-0 h-12 text-base"
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
        className="sm:max-w-lg border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/10 bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 overflow-hidden"
        showCloseButton={false}
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          {/* Glowing orbs */}
          <div className="absolute -top-20 -left-20 size-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 size-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          {/* Scan lines */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.02)_50%)] bg-[size:100%_4px] animate-pulse" />
        </div>

        <div className="relative text-center space-y-6 py-6">
          {/* Success Icon with animation */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Glowing ring */}
              <div
                className={`absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-cyan-400 via-primary to-cyan-400 blur-xl transition-all duration-1000 ${
                  isAnimating ? 'opacity-50 scale-100' : 'opacity-0 scale-50'
                }`}
              />
              {/* Icon container */}
              <div
                className={`relative rounded-full bg-gradient-to-br from-cyan-500 via-primary to-cyan-600 p-5 shadow-lg shadow-cyan-500/50 transition-all duration-700 ${
                  isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                }`}
              >
                <CheckCircle2 className="size-12 text-white" />
              </div>
              {/* Sparkles decoration */}
              <Sparkles
                className={`size-5 text-cyan-400 absolute -top-2 -right-3 transition-all duration-500 delay-300 ${
                  isAnimating ? 'opacity-100 scale-100 animate-pulse' : 'opacity-0 scale-0'
                }`}
              />
              <Sparkles
                className={`size-4 text-primary absolute -bottom-2 -left-3 transition-all duration-500 delay-500 ${
                  isAnimating ? 'opacity-100 scale-100 animate-pulse' : 'opacity-0 scale-0'
                }`}
              />
              <Zap
                className={`size-4 text-cyan-300 absolute -top-1 -left-4 transition-all duration-500 delay-400 ${
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
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-primary to-cyan-400 bg-clip-text text-transparent">
              Check-in Successful
            </h2>
            <p className="text-lg text-slate-300">
              Welcome,
            </p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {participantName}
            </p>
          </div>

          {/* Welcome text */}
          <p
            className={`text-sm text-cyan-200/70 transition-all duration-500 delay-500 ${
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
              className="w-full bg-gradient-to-r from-cyan-500 via-primary to-cyan-500 hover:from-cyan-400 hover:via-primary hover:to-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/30 border-0 h-12 text-base"
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
