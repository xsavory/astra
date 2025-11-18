import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Video, ExternalLink, Clock, Calendar, Users, AlertCircle, X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Button,
  Alert,
  AlertDescription,
} from '@repo/react-components/ui'
import api from 'src/lib/api'
import type { User } from 'src/types/schema'

interface ZoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

function ZoomDialog({ open, onOpenChange, user }: ZoomDialogProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768) // md breakpoint
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Fetch active event (for zoom meeting URL)
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['activeEvent'],
    queryFn: () => api.events.getEvent(),
    enabled: open, // Only fetch when dialog is open
  })

  // Check if event has zoom URL
  const hasZoomUrl = event?.zoom_meeting_url && event.zoom_meeting_url.trim() !== ''

  // Content component to be reused in both Dialog and Drawer
  const ZoomContent = () => (
    <div className="space-y-4">
      {!hasZoomUrl || isLoadingEvent ? (
        // No meeting URL available or still loading
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            {isLoadingEvent
              ? 'Loading meeting information...'
              : 'Zoom Meeting link is not available yet. Please contact the organizers or check back later.'}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Meeting Details */}
          <div className="space-y-3">
            {/* Event Name */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Event</p>
                <p className="text-sm text-muted-foreground">{event?.name}</p>
              </div>
            </div>

            {/* Event Date */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {event?.date ? new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </p>
              </div>
            </div>

            {/* Participant Type */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Participant Type</p>
                <p className="text-sm text-muted-foreground capitalize">{user.participant_type}</p>
              </div>
            </div>
          </div>

          {/* Join Button */}
          <Button
            asChild
            size="lg"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            <a
              href={event.zoom_meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <Video className="size-5" />
              Join Zoom Meeting
              <ExternalLink className="size-4" />
            </a>
          </Button>

          {/* Instructions */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="font-semibold text-sm">Instructions:</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
              <li>Make sure Zoom app is installed or use a browser</li>
              <li>Use your registered name when joining</li>
              <li>Ensure your audio and video are working properly</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )

  // Render Dialog for desktop
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="size-5" />
              Zoom Meeting
            </DialogTitle>
            <DialogDescription>
              Join the Expert Forum 2025 virtual session
            </DialogDescription>
          </DialogHeader>
          <ZoomContent />
        </DialogContent>
      </Dialog>
    )
  }

  // Render Drawer (bottom sheet) for mobile
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <Video className="size-5" />
            Zoom Meeting
          </DrawerTitle>
          <DrawerDescription>
            Join the Expert Forum 2025 virtual session
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto max-h-[70vh]">
          <ZoomContent />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" size="sm">
              <X className="size-4 mr-2" />
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ZoomDialog
