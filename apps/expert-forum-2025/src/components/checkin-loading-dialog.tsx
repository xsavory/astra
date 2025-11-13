import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@repo/react-components/ui'

interface CheckinLoadingDialogProps {
  open: boolean
}

function CheckinLoadingDialog({ open }: CheckinLoadingDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
      >
        <div className="text-center space-y-4 py-4">
          {/* Loading Spinner */}
          <div className="flex justify-center">
            <Loader2 className="size-16 text-primary animate-spin" />
          </div>

          {/* Loading Message */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-primary">
              Processing Check-in...
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait a moment
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CheckinLoadingDialog
