import { useState, useEffect } from 'react'
import { FileText, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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
} from '@repo/react-components/ui'

// Import PDF file
import pdfFile from '../assets/wall-of-expert2.pdf'

// Set worker path for react-pdf using CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface WallOfExpertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function WallOfExpertDialog({ open, onOpenChange }: WallOfExpertDialogProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [__isLoading__, setIsLoading] = useState(true)

  // Detect screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768) // md breakpoint
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Reset page number when dialog opens
  useEffect(() => {
    if (open) {
      setPageNumber(1)
    }
  }, [open])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setIsLoading(false)
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error)
    setIsLoading(false)
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset)
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  // Content component to be reused in both Dialog and Drawer
  const WallOfExpertContent = () => (
    <div className="space-y-4">
      {/* PDF Viewer */}
      <div className="flex flex-col items-center">
        <div className="w-full rounded-lg border border-border overflow-hidden bg-muted/30">
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FileText className="size-8 text-muted-foreground animate-pulse" />
                </div>
                <p className="text-sm font-medium text-center">Loading PDF...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="rounded-full bg-destructive/10 p-4 mb-4">
                  <FileText className="size-8 text-destructive" />
                </div>
                <p className="text-sm font-medium text-center text-destructive">
                  Failed to load PDF
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Please try again later
                </p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="mx-auto"
              width={isDesktop ? 560 : Math.min(window.innerWidth - 32, 400)}
            />
          </Document>
        </div>

        {/* Page Navigation */}
        {numPages && numPages > 1 && (
          <div className="flex items-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="size-4 mr-1" />
              Previous
            </Button>
            <p className="text-sm text-muted-foreground">
              Page {pageNumber} of {numPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={pageNumber >= numPages}
            >
              Next
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  // Render Dialog for desktop
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Wall of Expert
            </DialogTitle>
            <DialogDescription>
              Expert Forum 2025 Wall of Expert
            </DialogDescription>
          </DialogHeader>
          <WallOfExpertContent />
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
            <FileText className="size-5" />
            Wall of Expert
          </DrawerTitle>
          <DrawerDescription>
            Expert Forum 2025 Wall of Expert
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">
          <WallOfExpertContent />
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

export default WallOfExpertDialog
