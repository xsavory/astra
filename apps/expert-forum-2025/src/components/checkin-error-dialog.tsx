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
            Check-in Gagal
          </DialogTitle>
          <DialogDescription>
            Terjadi kesalahan saat melakukan check-in
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Participant info if available */}
          {participantName && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Peserta:</p>
              <p className="text-sm text-muted-foreground">{participantName}</p>
            </div>
          )}

          {/* Error message */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium mb-1">
              Pesan Error:
            </p>
            <p className="text-sm text-muted-foreground">
              {errorMessage}
            </p>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Silakan coba lagi atau hubungi tim teknis jika masalah berlanjut.</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CheckinErrorDialog
