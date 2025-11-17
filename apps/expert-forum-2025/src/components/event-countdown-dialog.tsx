import * as React from 'react'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/react-components/ui'
import { Calendar, Clock } from 'lucide-react'
import AppButton from './app-button'

export interface EventCountdownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventDate: string | null
  isActive: boolean
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeRemaining(targetDate: string): TimeRemaining | null {
  const now = new Date().getTime()
  const target = new Date(targetDate).getTime()
  const difference = target - now

  if (difference <= 0) {
    return null
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
  }
}

function formatEventDate(dateString: string) {
  const date = new Date(dateString)

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return { weekday, date: dateStr, time: timeStr }
}

const EventCountdownDialog = React.forwardRef<
  HTMLDivElement,
  EventCountdownDialogProps
>(({ open, onOpenChange, eventDate, isActive }, ref) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    eventDate ? calculateTimeRemaining(eventDate) : null
  )

  useEffect(() => {
    if (!eventDate) return

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(eventDate)
      setTimeRemaining(remaining)

      // Stop countdown when event has started
      if (!remaining) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [eventDate])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isActive) return null;
    onOpenChange(isOpen)
  }

  const hasEventStarted = !timeRemaining && eventDate
  const formattedDate = eventDate ? formatEventDate(eventDate) : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={ref}
        className="sm:max-w-md border-2 border-primary/30 shadow-2xl"
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/10 p-4 border-2 border-primary/30">
              <Calendar className="size-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-3xl bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent font-bold">
            Event Countdown
          </DialogTitle>
          {formattedDate ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-primary">
                {formattedDate.weekday}
              </p>
              <p className="text-muted-foreground">
                {formattedDate.date}
              </p>
              <p className="text-sm font-semibold text-muted-foreground">
                {formattedDate.time} AM
              </p>
            </div>
          ) : (
            <DialogDescription className="text-center">
              Event date will be announced soon
            </DialogDescription>
          )}
        </DialogHeader>

        {eventDate && (
          <div className="space-y-6 py-4">
            {hasEventStarted ? (
              // Event has started
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-green-500/15 to-emerald-500/10 p-6 border-2 border-green-500/40 shadow-lg">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full bg-green-500/20 p-3">
                      <Clock className="size-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-green-700 dark:text-green-300">
                        Event Has Started!
                      </p>
                      <p className="text-sm text-green-600/80 dark:text-green-400/80">
                        Welcome to Expert Forum 2025
                      </p>
                    </div>
                  </div>
                </div>
                <AppButton
                  variant="default"
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                >
                  Enter App
                </AppButton>
              </div>
            ) : (
              // Countdown display
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {/* Days */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/10 p-4 border-2 border-primary/30 shadow-lg">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <div className="relative flex flex-col items-center gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-br from-primary to-cyan-500 bg-clip-text text-transparent">
                        {timeRemaining?.days}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Days
                      </span>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/10 p-4 border-2 border-primary/30 shadow-lg">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <div className="relative flex flex-col items-center gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-br from-primary to-cyan-500 bg-clip-text text-transparent">
                        {timeRemaining?.hours}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Hours
                      </span>
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/10 p-4 border-2 border-primary/30 shadow-lg">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <div className="relative flex flex-col items-center gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-br from-primary to-cyan-500 bg-clip-text text-transparent">
                        {timeRemaining?.minutes}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Mins
                      </span>
                    </div>
                  </div>

                  {/* Seconds */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/10 p-4 border-2 border-primary/30 shadow-lg">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <div className="relative flex flex-col items-center gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-br from-primary to-cyan-500 bg-clip-text text-transparent">
                        {timeRemaining?.seconds}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Sec
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!eventDate && (
          <div className="py-8">
            <div className="rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/5 p-6 border-2 border-gray-500/30 text-center">
              <p className="text-sm text-muted-foreground">
                Event date will be announced soon
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
})

EventCountdownDialog.displayName = 'EventCountdownDialog'

export default EventCountdownDialog
