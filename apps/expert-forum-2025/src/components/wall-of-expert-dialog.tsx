import { useState, useEffect } from 'react'
import { FileText, X } from 'lucide-react'

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

interface WallOfExpertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function WallOfExpertDialog({ open, onOpenChange }: WallOfExpertDialogProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768) // md breakpoint
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Content component to be reused in both Dialog and Drawer
  const WallOfExpertContent = () => (
    <div className="space-y-4">
      {/* PDF Placeholder */}
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-center">Wall of Expert PDF</p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          PDF file will be displayed here
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <p className="font-semibold text-sm">About Wall of Expert:</p>
        <p className="text-sm text-muted-foreground">
          View the Expert Forum 2025 Wall of Expert document showcasing all our distinguished experts and their contributions.
        </p>
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
        <div className="px-4 pb-4 overflow-y-auto max-h-[70vh]">
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
