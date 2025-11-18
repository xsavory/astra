import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QrCode, LogIn, Loader2 } from 'lucide-react'

import ParticipantQRDialog from 'src/components/participant-qr-dialog'
import EventCountdownDialog from 'src/components/event-countdown-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  toast,
} from '@repo/react-components/ui'
import api from 'src/lib/api'
import type { User, Event } from 'src/types/schema'

interface ParticipantPreCheckinPageProps {
  user: User
  event?: Event
}

function ParticipantPreCheckinPage({ user, event }: ParticipantPreCheckinPageProps) {
  const queryClient = useQueryClient()
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [isCountdownDialogOpen, setIsCountdownDialogOpen] = useState(false)

  // Auto-show countdown dialog when event is not active and hasn't started yet
  useEffect(() => {
    if (!event) return

    const shouldShowCountdown = !event.is_active && event.event_dates

    if (shouldShowCountdown && event.event_dates) {
      const eventDate = new Date(event.event_dates)
      const now = new Date()

      // Only show if event hasn't started yet
      if (eventDate > now) {
        setIsCountdownDialogOpen(true)
      }
    }
  }, [event])

  // Manual check-in mutation for online participants
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not found')
      return api.checkins.checkinEvent(user.id, 'manual')
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })

      toast.success('Check-in successful! Welcome to Expert Forum 2025')
    },
    onError: (error) => {
      toast.warning(error instanceof Error ? error.message : 'An error occurred during check-in')
    },
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>
            {user.name}
          </CardDescription>
          <Badge
            variant={user.participant_type === 'offline' ? 'default' : 'secondary'}
            className="mx-auto mt-2"
          >
            {user.participant_type === 'offline' ? 'Offline' : 'Online'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {user.participant_type === 'offline'
              ? 'Show your QR Code to staff to check in'
              : 'Click the button below to check in and access the event'
            }
          </p>

          {user.participant_type === 'offline' ? (
            // Offline: Show QR button
            <Button
              onClick={() => setIsQRDialogOpen(true)}
              size="lg"
              className="w-full"
            >
              <QrCode className="mr-2 size-5" />
              Show QR Code
            </Button>
          ) : (
            // Online: Show Check-in button
            <Button
              onClick={() => checkInMutation.mutate()}
              disabled={checkInMutation.isPending}
              size="lg"
              className="w-full"
            >
              {checkInMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 size-5" />
                  Check-in Now
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* QR Dialog for offline participants */}
      {user.participant_type === 'offline' && (
        <ParticipantQRDialog
          user={user}
          open={isQRDialogOpen}
          onOpenChange={setIsQRDialogOpen}
        />
      )}

      {/* Event Countdown Dialog - Auto-shown when event is not active */}
      <EventCountdownDialog
        open={isCountdownDialogOpen}
        onOpenChange={setIsCountdownDialogOpen}
        eventDate={event?.event_dates || null}
        isActive={event?.is_active || false}
      />
    </div>
  )
}

export default ParticipantPreCheckinPage
