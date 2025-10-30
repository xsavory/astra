import { useState, useEffect } from 'react'
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
} from '@repo/react-components/ui'
import { QRCodeScanner } from '@repo/react-components/ui'

interface BoothQRScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function BoothQRScannerDialog({ open, onOpenChange }: BoothQRScannerDialogProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [scannerReady, setScannerReady] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  // Detect screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768) // md breakpoint
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setScannerReady(false)
      setScanError(null)
    }
  }, [open])

  // Handle QR scan
  const handleScan = (data: string, parsedData?: unknown) => {
    console.log('QR Code scanned:', data)
    console.log('Parsed data:', parsedData)

    // TODO: Implement booth validation and check-in logic
    // 1. Validate booth ID from QR data
    // 2. Check if booth already visited
    // 3. If valid and not visited -> open booth question dialog
    // 4. If already visited -> show error message
    // 5. If invalid -> show error message
  }

  // Handle scanner errors
  const handleScanError = (error: string | Error) => {
    const errorMessage = typeof error === 'string' ? error : error.message
    console.error('Scanner error:', errorMessage)
    setScanError(errorMessage)
  }

  // Scanner content component
  const ScannerContent = () => (
    <div className="space-y-4">
      {/* Scanner Status */}
      {!scannerReady && !scanError && (
        <Alert>
          <QrCode className="size-4" />
          <AlertDescription>
            Memuat kamera...
          </AlertDescription>
        </Alert>
      )}

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
      <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-lg bg-black">
        {open && (
          <QRCodeScanner
            open={open}
            onScan={handleScan}
            onError={handleScanError}
            onScannerReady={() => {
              setScannerReady(true)
              setScanError(null)
            }}
            preferredCamera="environment"
            highlightScanRegion={true}
            highlightCodeOutline={true}
            maxScansPerSecond={5}
          />
        )}
      </div>

      {/* Instructions */}
      {scannerReady && !scanError && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Arahkan kamera ke QR Code booth</p>
          <p className="text-xs text-muted-foreground">
            QR Code akan di-scan secara otomatis
          </p>
        </div>
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
              <QrCode className="size-5" />
              Scan Booth QR Code
            </DialogTitle>
            <DialogDescription>
              Scan QR code pada booth untuk check-in
            </DialogDescription>
          </DialogHeader>
          <ScannerContent />
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
            <QrCode className="size-5" />
            Scan Booth QR Code
          </DrawerTitle>
          <DrawerDescription>
            Scan QR code pada booth untuk check-in
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto max-h-[75vh]">
          <ScannerContent />
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
