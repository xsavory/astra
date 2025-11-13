import { useState, useCallback } from 'react'
import { Download, QrCode } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  QRCodeGenerator,
} from '@repo/react-components/ui'
import type { User } from 'src/types/schema'

interface ParticipantQRDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ParticipantQRDialog({
  user,
  open,
  onOpenChange,
}: ParticipantQRDialogProps) {
  const [qrGenerated, setQrGenerated] = useState(false)
  const [downloadQR, setDownloadQR] = useState<((options: { fileName: string }) => void) | null>(null)

  // QR data: participant ID and name
  const participantQRData = {
    participantId: user.id,
    name: user.name,
  }

  // Handler: QR code generated
  const handleQRGenerated = useCallback((success: boolean) => {
    setQrGenerated(success)
    if (!success) {
      console.error('Failed to generate QR code')
    }
  }, [])

  // Handler: QR code ready (expose download method)
  const handleQRReady = useCallback((methods: { download: (options: { fileName: string }) => void }) => {
    setDownloadQR(() => methods.download)
  }, [])

  // Handler: Download QR code
  const handleDownloadClick = useCallback(() => {
    if (!downloadQR) return

    // Sanitize filename - replace special chars with underscore
    const sanitizedName = user.name.replace(/[^a-zA-Z0-9]/g, '_')
    downloadQR({ fileName: sanitizedName })
  }, [downloadQR, user.name])

  const content = (
    <div className="space-y-6">
      {/* QR Code Canvas */}
      <div className="flex justify-center">
        <QRCodeGenerator
          data={participantQRData}
          onGenerated={handleQRGenerated}
          onReady={handleQRReady}
          className="flex justify-center"
        />
      </div>

      {/* Download Button */}
      <Button
        onClick={handleDownloadClick}
        disabled={!qrGenerated}
        className="w-full"
        size="lg"
      >
        <Download className="mr-2 size-4" />
        Download QR Code
      </Button>

      {/* Helper Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Anda juga dapat menyimpan QR code ini untuk digunakan nanti
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5" />
            QR Code Check-in
          </DialogTitle>
          <DialogDescription className='text-left'>
            Scan QR code untuk melakukan check-in
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

export default ParticipantQRDialog
