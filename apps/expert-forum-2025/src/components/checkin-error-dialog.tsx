import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@repo/react-components/ui'

interface CheckinErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  errorMessage: string
  participantName?: string
}

function CheckinErrorDialog({
  open,
  onOpenChange,
  errorMessage,
  participantName,
}: CheckinErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-destructive/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5" />
            Check-in Failed
          </DialogTitle>
          <DialogDescription>
            An error occurred during check-in
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Participant info if available */}
          {participantName && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Participant:</p>
              <p className="text-sm text-muted-foreground">{participantName}</p>
            </div>
          )}

          {/* Error message */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium mb-1">
              Error Message:
            </p>
            <p className="text-sm text-muted-foreground">
              {errorMessage}
            </p>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Please try again or contact the technical team if the problem persists.</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CheckinErrorDialog
