import * as React from "react";
import QRCode from "qrcode";
import QrScanner from "qr-scanner";

/* ============================================
 * TypeScript Interfaces & Types
 * ============================================ */

type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QRCodeGeneratorRef {
  download: (options: { fileName: string }) => void;
  canvas: HTMLCanvasElement | null;
}

interface QRCodeGeneratorProps {
  data: object | string;
  width?: number;
  margin?: number;
  errorCorrectionLevel?: QRErrorCorrectionLevel;
  onGenerated?: (success: boolean) => void;
  onReady?: (methods: { download: (options: { fileName: string }) => void }) => void;
  className?: string;
}

interface QRCodeScannerProps {
  open: boolean;
  onScan: (data: string, parsedData?: any) => void;
  onError?: (error: string | Error) => void;
  onScannerReady?: () => void;
  onScanningChange?: (isScanning: boolean) => void;
  idleTimeout?: number;
  onIdleTimeout?: () => void;
  preferredCamera?: 'environment' | 'user';
  maxScansPerSecond?: number;
  highlightScanRegion?: boolean;
  highlightCodeOutline?: boolean;
}

/* ============================================
 * QRCodeGenerator Component
 * ============================================ */

const QRCodeGenerator = React.forwardRef<QRCodeGeneratorRef, QRCodeGeneratorProps>(
  (
    {
      data,
      width = 256,
      margin = 2,
      errorCorrectionLevel = 'M',
      onGenerated,
      onReady,
      className,
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    // Download function
    const download = React.useCallback((options: { fileName: string }) => {
      if (!canvasRef.current) {
        console.error('Canvas not available for download');
        return;
      }

      canvasRef.current.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          return;
        }

        // Sanitize filename
        const sanitizedFilename = options.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const finalFilename = sanitizedFilename.endsWith('.png')
          ? sanitizedFilename
          : `${sanitizedFilename}.png`;

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFilename;
        link.click();

        // Cleanup
        URL.revokeObjectURL(url);
      });
    }, []);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      download,
      canvas: canvasRef.current,
    }), [download]);

    // Generate QR code
    React.useEffect(() => {
      const generateQR = async () => {
        if (!canvasRef.current) {
          console.error('Canvas element not available');
          return;
        }

        try {
          // Convert data to string if it's an object
          const qrData = typeof data === 'object'
            ? JSON.stringify(data)
            : data;

          await QRCode.toCanvas(canvasRef.current, qrData, {
            width,
            margin,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
            errorCorrectionLevel,
          });

          onGenerated?.(true);

          // Call onReady with download method
          onReady?.({ download });
        } catch (error) {
          console.error('Failed to generate QR code:', error);
          onGenerated?.(false);
        }
      };

      generateQR();
    }, [data, width, margin, errorCorrectionLevel, onGenerated, onReady, download]);

    return (
      <div className={className}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    );
  }
);

QRCodeGenerator.displayName = 'QRCodeGenerator';

/* ============================================
 * QRCodeScanner Component
 * ============================================ */

const QRCodeScanner = ({
  open,
  onScan,
  onError,
  onScannerReady,
  onScanningChange,
  idleTimeout = 7000,
  onIdleTimeout,
  preferredCamera = 'environment',
  maxScansPerSecond = 5,
  highlightScanRegion = true,
  highlightCodeOutline = true,
}: QRCodeScannerProps): React.JSX.Element => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scannerRef = React.useRef<QrScanner | null>(null);
  const idleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  // Clear idle timer
  const clearIdleTimer = React.useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  // Reset idle timer
  const resetIdleTimer = React.useCallback(() => {
    clearIdleTimer();

    if (idleTimeout > 0) {
      idleTimerRef.current = setTimeout(() => {
        console.info('⏱️ Scanner idle timeout');
        onIdleTimeout?.();
      }, idleTimeout);
    }
  }, [idleTimeout, onIdleTimeout, clearIdleTimer]);

  // Handle scan callback
  const handleScan = React.useCallback(
    (result: { data: string }) => {
      const { data: qrData } = result;

      // Reset idle timer on scan activity
      resetIdleTimer();

      // Try to parse as JSON
      let parsedData: any = undefined;
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        // Not JSON, that's okay - pass raw data only
      }

      // Call onScan with both raw and parsed data
      onScan(qrData, parsedData);
    },
    [onScan, resetIdleTimer]
  );

  // Update parent about scanning state
  React.useEffect(() => {
    onScanningChange?.(isScanning);
  }, [isScanning, onScanningChange]);

  // Initialize scanner when modal opens
  React.useEffect(() => {
    if (!open) {
      clearIdleTimer();
      return;
    }

    let scanner: QrScanner | null = null;
    let mounted = true;

    const initScanner = async () => {
      // Wait for video element to be ready
      let retries = 0;
      while (!videoRef.current && retries < 10 && mounted) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }

      if (!videoRef.current || !mounted) {
        console.info('Video element not available or component unmounted');
        return;
      }

      try {
        console.info('📷 Initializing QR scanner...');
        const video = videoRef.current;

        scanner = new QrScanner(
          video,
          handleScan,
          {
            returnDetailedScanResult: true,
            preferredCamera,
            maxScansPerSecond,
            highlightScanRegion,
            highlightCodeOutline,
          }
        );

        scannerRef.current = scanner;

        await scanner.start();
        console.info('✅ Scanner started successfully');
        setIsScanning(true);
        onScannerReady?.();

        // Start idle timer when scanner is ready
        resetIdleTimer();
      } catch (error) {
        console.error('❌ Scanner error:', error);
        const errorMessage = error instanceof Error ? error : 'Failed to access camera';
        onError?.(errorMessage);
      }
    };

    initScanner();

    // Cleanup
    return () => {
      mounted = false;
      console.info('🔌 Cleaning up scanner...');
      clearIdleTimer();
      if (scanner) {
        scanner.stop();
        scanner.destroy();
      }
      scannerRef.current = null;
      setIsScanning(false);
    };
  }, [
    open,
    handleScan,
    resetIdleTimer,
    clearIdleTimer,
    onError,
    onScannerReady,
    preferredCamera,
    maxScansPerSecond,
    highlightScanRegion,
    highlightCodeOutline,
  ]);

  return (
    <video
      ref={videoRef}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
      playsInline
      muted
    />
  );
}

QRCodeScanner.displayName = 'QRCodeScanner';

export { QRCodeGenerator, QRCodeScanner };
export type { QRCodeGeneratorProps, QRCodeGeneratorRef, QRCodeScannerProps, QRErrorCorrectionLevel };
