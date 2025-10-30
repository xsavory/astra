import { useState, useEffect, useCallback, useMemo } from 'react'
import { QrCode, X, AlertCircle } from 'lucide-react'

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
    console.log('QR Code scanned:', data)
    console.log('Parsed data:', parsedData)

    // TODO: Implement booth validation and check-in logic
    // 1. Validate booth ID from QR data
    // 2. Check if booth already visited
    // 3. If valid and not visited -> open booth question dialog
    // 4. If already visited -> show error message
    // 5. If invalid -> show error message

    // Close dialog after successful scan
    onOpenChange(false)
  }, [onOpenChange])

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
          maxScansPerSecond={1}
          onScan={handleScan}
          onError={handleScanError}
          onScannerReady={handleScannerReady}
          onScanningChange={handleScanningChange}
          onIdleTimeout={handleIdleTimeout}
          preferredCamera="environment"
          highlightScanRegion={true}
          highlightCodeOutline={true}
        />

        {/* Loading State */}
        {!isScanning && !scanError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Memuat kamera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {isScanning && !scanError && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Arahkan kamera ke QR Code booth</p>
          <p className="text-xs text-muted-foreground">
            QR Code akan di-scan secara otomatis
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
              Scan QR code pada booth untuk check-in
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
            Scan QR code pada booth untuk check-in
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto max-h-[75vh]">
          {scannerContent}
        </div>
        <div className="p-4 border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              <X className="size-4 mr-2" />
              Tutup
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default BoothQRScannerDialog
