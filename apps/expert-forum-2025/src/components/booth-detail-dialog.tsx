import { useState, useEffect, useCallback, useMemo } from 'react'
import { Building2, X, CheckCircle2 } from 'lucide-react'

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
  DrawerFooter,
  Button,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import BoothCheckinDialog from './booth-checkin-dialog'

interface BoothDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock data for booth
const MOCK_BOOTH_DATA = {
  id: 'booth-001',
  name: 'Astra Financial',
  description: `Astra Financial adalah salah satu pilar kekuatan Grup Astra yang bergerak di bidang jasa keuangan.

Kami menyediakan berbagai solusi pembiayaan untuk kendaraan roda dua dan roda empat, serta layanan asuransi yang komprehensif. Dengan jaringan yang luas di seluruh Indonesia, kami berkomitmen untuk memberikan pelayanan terbaik dan membantu mewujudkan impian masyarakat Indonesia.

Visi kami adalah menjadi perusahaan pembiayaan terkemuka di Indonesia yang memberikan nilai tambah kepada seluruh stakeholder.`,
  imageUrl: '/placeholder-booth.jpg', // Placeholder for now
  question: 'Apa yang paling menarik perhatian Anda tentang Astra Financial dan bagaimana Anda melihat diri Anda berkontribusi di perusahaan kami?',
}

function BoothDetailDialog({ open, onOpenChange }: BoothDetailDialogProps) {
  const isMobile = useIsMobile()

  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setCheckInDialogOpen(false)
      setIsSubmitting(false)
    }
  }, [open])

  // Handle check-in button click
  const handleCheckInClick = useCallback(() => {
    setCheckInDialogOpen(true)
  }, [])

  // Handle check-in submission
  const handleCheckInSubmit = useCallback(async (answer: string) => {
    setIsSubmitting(true)

    // TODO: Implement actual check-in API call
    await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call

    console.log('Check-in submitted:', {
      boothId: MOCK_BOOTH_DATA.id,
      answer: answer,
    })

    setIsSubmitting(false)
    setCheckInDialogOpen(false)
    onOpenChange(false)

    // TODO: Show success toast/notification
  }, [onOpenChange])

  // Booth content component - Memoized to prevent unnecessary re-renders
  const boothContent = useMemo(() => (
    <div className="space-y-4">
      {/* Booth Image - Full width exhibition style */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">Booth Image Placeholder</p>
            <p className="text-sm opacity-75">{MOCK_BOOTH_DATA.name}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className='w-full hidden md:block'>
        <Button onClick={handleCheckInClick} className='w-full'>
          <CheckCircle2 className="size-4 mr-2" />
          Check-in Sekarang
        </Button>
      </div>
      {/* Company Description */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Tentang {MOCK_BOOTH_DATA.name}</h3>
        <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
          {MOCK_BOOTH_DATA.description}
        </div>
      </div>
    </div>
  ), [handleCheckInClick])


  // Render Dialog for desktop
  if (!isMobile) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                {MOCK_BOOTH_DATA.name}
              </DialogTitle>
              <DialogDescription>
                Virtual Exhibition Booth
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {boothContent}
            </div>
          </DialogContent>
        </Dialog>
        <BoothCheckinDialog
          open={checkInDialogOpen}
          onOpenChange={setCheckInDialogOpen}
          question={MOCK_BOOTH_DATA.question}
          onSubmit={handleCheckInSubmit}
          isSubmitting={isSubmitting}
        />
      </>
    )
  }

  // Render Drawer (bottom sheet) for mobile
  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              {MOCK_BOOTH_DATA.name}
            </DrawerTitle>
            <DrawerDescription>
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[70vh]">
            {boothContent}
          </div>
          <DrawerFooter className="pt-4 border-t">
            <Button onClick={handleCheckInClick} className="w-full">
              <CheckCircle2 className="size-4 mr-2" />
              Check-in Sekarang
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                <X className="size-4 mr-2" />
                Tutup
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <BoothCheckinDialog
        open={checkInDialogOpen}
        onOpenChange={setCheckInDialogOpen}
        question={MOCK_BOOTH_DATA.question}
        onSubmit={handleCheckInSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default BoothDetailDialog
