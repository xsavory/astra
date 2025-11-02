import { useEffect, useState } from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@repo/react-components/ui'

interface CheckinGreetingAnimationProps {
  open: boolean
  participantName: string
  onOpenChange?: (open: boolean) => void
  duration?: number // in milliseconds
}

function CheckinGreetingAnimation({
  open,
  participantName,
  onOpenChange,
  duration = 2000
}: CheckinGreetingAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (open) {
      // Trigger animation on open
      setIsAnimating(true)

      // Auto-close after duration
      const timer = setTimeout(() => {
        setIsAnimating(false)
        // Close dialog after fade-out animation
        setTimeout(() => {
          onOpenChange?.(false)
        }, 300)
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
    }
  }, [open, duration, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md border-none shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
        showCloseButton={false}
      >
        <div className="text-center space-y-6 py-4">
          {/* Success Icon with animation */}
          <div className="relative flex justify-center">
            <div className="relative">
              <CheckCircle2
                className={`size-20 text-green-600 transition-all duration-700 ${
                  isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                }`}
              />
              {/* Sparkles decoration */}
              <Sparkles
                className={`size-6 text-yellow-500 absolute -top-2 -right-2 transition-all duration-500 delay-300 ${
                  isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
              />
              <Sparkles
                className={`size-6 text-yellow-500 absolute -bottom-2 -left-2 transition-all duration-500 delay-500 ${
                  isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
              />
            </div>
          </div>

          {/* Success Message */}
          <div
            className={`space-y-2 transition-all duration-500 delay-300 ${
              isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <h2 className="text-2xl font-bold text-green-600">
              Check-in Berhasil!
            </h2>
            <p className="text-lg font-medium">
              Selamat Datang,
            </p>
            <p className="text-xl font-semibold text-primary">
              {participantName}
            </p>
          </div>

          {/* Welcome text */}
          <p
            className={`text-sm text-muted-foreground transition-all duration-500 delay-500 ${
              isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Nikmati acara Expert Forum 2025
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CheckinGreetingAnimation
