import { useState, useEffect, useCallback, useMemo } from 'react'
import { QrCode, X, AlertCircle } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

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
  DrawerHeader,
  DrawerTitle,
  Button,
  Alert,
  AlertDescription,
  QRCodeScanner
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'

interface BoothQRScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function BoothQRScannerDialog({ open, onOpenChange }: BoothQRScannerDialogProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

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
  const handleScan = useCallback((data: string) => {
    try {
      // Parse URL from QR code
      const url = new URL(data)
      const boothId = url.searchParams.get('booth_id')

      if (boothId) {
        // Close scanner dialog
        onOpenChange(false)

        // Navigate to participant/booth page with booth_id query parameter
        // This will trigger booth-detail-dialog to open
        navigate({
          to: '/participant/booth',
          search: { booth_id: boothId },
        })
      } else {
        setScanError('Invalid QR Code. Booth ID not found.')
      }
    } catch (error) {
      // If URL parsing fails, show error
      console.error('Failed to parse QR code URL:', error)
      setScanError('Invalid QR Code. Make sure you scan the correct booth QR code.')
    }
  }, [onOpenChange, navigate])

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
        />

        {/* Loading State */}
        {!isScanning && !scanError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Loading camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {isScanning && !scanError && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Point camera at booth QR Code</p>
          <p className="text-xs text-muted-foreground">
            QR Code will be scanned automatically
          </p>
        </div>
      )}
    </div>
  ), [open, scanError, isScanning, handleScan, handleScanError, handleScannerReady, handleScanningChange, handleIdleTimeout])

  // Render Dialog for desktop
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between mr-6">
              <div className="flex items-center gap-3">
                <QrCode className="size-5" />
                Scan Booth QR Code
              </div>
              {/* Scanner Active Indicator */}
              {isScanning && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-green-600 text-sm font-medium">
                    Active
                  </span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Scan QR code at the booth to check in
            </DialogDescription>
          </DialogHeader>
          {scannerContent}
        </DialogContent>
      </Dialog>
    )
  }

  // Render Drawer (bottom sheet) for mobile
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center justify-between mr-6">
            <div className="flex items-center gap-3">
              <QrCode className="size-5" />
              Scan Booth QR Code
            </div>
            {/* Scanner Active Indicator */}
            {isScanning && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-green-600 text-sm font-medium">
                  Active
                </span>
              </div>
            )}
          </DrawerTitle>
          <DrawerDescription>
            Scan QR code at the booth to check in
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto max-h-[75vh]">
          {scannerContent}
        </div>
        <div className="p-4 border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              <X className="size-4 mr-2" />
              Close
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default BoothQRScannerDialog
