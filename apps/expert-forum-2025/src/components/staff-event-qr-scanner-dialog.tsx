import { useState, useEffect, useCallback, useMemo } from 'react'
import { QrCode, AlertCircle, Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Alert,
  AlertDescription,
  QRCodeScanner
} from '@repo/react-components/ui'

interface StaffEventQRScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanSuccess: (participantData: { participantId: string; name: string }) => void
}

function StaffEventQRScannerDialog({
  open,
  onOpenChange,
  onScanSuccess
}: StaffEventQRScannerDialogProps) {
  const [scanError, setScanError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setScanError(null)
      setIsScanning(false)
    }
  }, [open])

  // Handler: QR Code scan
  const handleScan = useCallback((data: string, parsedData?: unknown) => {
    try {
      // Parse JSON data from QR code
      const qrData = typeof parsedData === 'object' && parsedData !== null
        ? parsedData as Record<string, unknown>
        : JSON.parse(data)

      // Validate required fields
      if (!qrData.participantId || !qrData.name) {
        setScanError('Invalid QR Code. Participant data is incomplete.')
        return
      }

      // Extract participant data
      const participantData = {
        participantId: String(qrData.participantId),
        name: String(qrData.name),
      }

      // Close scanner and trigger success callback
      onOpenChange(false)
      onScanSuccess(participantData)

    } catch (error) {
      // If JSON parsing fails, show error
      console.error('Failed to parse QR code data:', error)
      setScanError('Invalid QR Code. Make sure you scan the correct participant QR code.')
    }
  }, [onOpenChange, onScanSuccess])

  // Handler: Scanner error
  const handleScanError = useCallback((error: string | Error) => {
    const errorMessage = typeof error === 'string' ? error : error.message
    console.error('Scanner error:', errorMessage)
    setScanError(errorMessage)
  }, [])

  // Handler: Scanner ready
  const handleScannerReady = useCallback(() => {
    setScanError(null)
  }, [])

  // Handler: Scanning state change
  const handleScanningChange = useCallback((scanning: boolean) => {
    setIsScanning(scanning)
  }, [])

  // Handler: Idle timeout
  const handleIdleTimeout = useCallback(() => {
    console.info('⏱️ Scanner idle timeout - closing modal')
    onOpenChange(false)
  }, [onOpenChange])

  // Scanner content - Memoized to prevent unnecessary re-renders
  const scannerContent = useMemo(() => (
    <div className="space-y-4">
      {/* Scanner Error */}
      {scanError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            {scanError}
          </AlertDescription>
        </Alert>
      )}

      {/* Scanner View */}
      <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg bg-black" style={{ height: '500px' }}>
        <QRCodeScanner
          open={open}
          onScan={handleScan}
          onError={handleScanError}
          onScannerReady={handleScannerReady}
          onScanningChange={handleScanningChange}
          onIdleTimeout={handleIdleTimeout}
          preferredCamera='user'
        />

        {/* Loading State */}
        {!isScanning && !scanError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {isScanning && !scanError && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Point camera at participant QR Code</p>
          <p className="text-xs text-muted-foreground">
            QR Code will be scanned automatically
          </p>
        </div>
      )}

      {/* Retry button on error */}
      {scanError && (
        <Button
          onClick={() => setScanError(null)}
          variant="outline"
          className="w-full"
        >
          Try Again
        </Button>
      )}
    </div>
  ), [open, scanError, isScanning, handleScan, handleScanError, handleScannerReady, handleScanningChange, handleIdleTimeout])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between mr-6">
            <div className="flex items-center gap-3">
              <QrCode className="size-5" />
              Scan Participant QR Code
            </div>
            {/* Scanner Active Indicator */}
            {isScanning && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-medium">
                  Active
                </span>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            Scan participant QR code to perform event check-in
          </DialogDescription>
        </DialogHeader>
        {scannerContent}
      </DialogContent>
    </Dialog>
  )
}

export default StaffEventQRScannerDialog
