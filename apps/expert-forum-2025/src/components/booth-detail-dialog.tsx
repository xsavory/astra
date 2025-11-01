import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Building2, X, CheckCircle2, Image } from 'lucide-react'

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
  toast,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import BoothCheckinDialog from './booth-checkin-dialog'
import api from 'src/lib/api'
import { getBoothVisualImage } from 'src/lib/utils'
import type { Booth, User, BoothCheckin } from 'src/types/schema'

interface BoothDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  existingCheckin?: BoothCheckin | null
}

function BoothDetailDialog({ open, onOpenChange, user, existingCheckin = null }: BoothDetailDialogProps) {
  const isMobile = useIsMobile()
  const searchParams = useSearch({ strict: false }) as { booth_id?: string }
  const queryClient = useQueryClient()

  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false)
  const [isPosterOpen, setIsPosterOpen] = useState(false)
  const [randomQuestion, setRandomQuestion] = useState<string>('')

  // Fetch booth data based on booth_id from URL
  const { data: booth, isLoading } = useQuery<Booth>({
    queryKey: ['booth', searchParams.booth_id],
    queryFn: () => api.booths.getBooth(searchParams.booth_id!),
    enabled: !!searchParams.booth_id && open,
  })

  const hasCheckedIn = !!existingCheckin

  // Booth check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (answer: string) => {
      if (!booth?.id) throw new Error('Booth not found')
      return api.checkins.checkinBooth(user.id, {
        booth_id: booth.id,
        answer: answer,
      })
    },
    onSuccess: () => {
      // Invalidate queries to refresh booth checkins data
      queryClient.invalidateQueries({ queryKey: ['boothCheckins', user.id] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })

      // Show success toast
      toast.success(`Check-in berhasil ke booth ${booth?.name}!`)

      // Close dialogs and navigate back
      setCheckInDialogOpen(false)
      onOpenChange(false)
    },
    onError: (error) => {
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat check-in'
      toast.warning(errorMessage)
    },
  })

  // Generate random question when booth data is loaded
  useEffect(() => {
    if (booth && booth.questions.length > 0) {
      const question = api.booths.getRandomQuestion(booth)
      setRandomQuestion(question)
    }
  }, [booth])

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setCheckInDialogOpen(false)
      setIsPosterOpen(false)
      setRandomQuestion('')
    }
  }, [open])

  // Handle check-in button click
  const handleCheckInClick = useCallback(() => {
    setCheckInDialogOpen(true)
  }, [])

  // Handle check-in submission
  const handleCheckInSubmit = useCallback(async (answer: string) => {
    checkInMutation.mutate(answer)
  }, [checkInMutation])

  // Booth content component - Memoized to prevent unnecessary re-renders
  const boothContent = useMemo(() => {
    if (!booth) return null

    const boothVisualImage = getBoothVisualImage(booth.id)

    return (
      <div className="space-y-4">
        {/* Booth Visual Image - Full width exhibition style */}
        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden">
          {boothVisualImage ? (
            <img
              src={boothVisualImage}
              alt={booth.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">Booth Image Placeholder</p>
                <p className="text-sm opacity-75">{booth.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Check-in Status Card - Show if already checked in */}
        {hasCheckedIn && existingCheckin && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="size-5" />
                Anda sudah check-in ke booth ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Jawaban Anda:</p>
                <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded-md border">
                  {existingCheckin.answer || 'Tidak ada jawaban'}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Check-in pada: {new Date(existingCheckin.checkin_time).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Menu */}
        <div className='w-full hidden md:block'>
          <Button
            onClick={handleCheckInClick}
            className='w-full'
            disabled={hasCheckedIn}
          >
            <CheckCircle2 className="size-4 mr-2" />
            {hasCheckedIn ? 'Sudah Check-in' : 'Check-in Sekarang'}
          </Button>
        </div>

        {/* Company Description */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Tentang {booth.name}</h3>
          <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {booth.description || 'Deskripsi booth tidak tersedia'}
          </div>
        </div>

        {/* Poster CTA Button - Only show if booth has poster */}
        {booth.poster_url && (
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsPosterOpen(true)}
            >
              <Image className="size-4 mr-2" />
              Lihat Poster Booth
            </Button>
          </div>
        )}
      </div>
    )
  }, [booth, handleCheckInClick, hasCheckedIn, existingCheckin])

  // Loading skeleton
  if (isLoading || !booth) {
    return null
  }


  // Render Dialog for desktop
  if (!isMobile) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                {booth.name}
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

        {/* Nested Poster Dialog */}
        <Dialog open={isPosterOpen} onOpenChange={setIsPosterOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Image className="size-5" />
                Poster {booth.name}
              </DialogTitle>
              <DialogDescription>
                Klik pada gambar untuk melihat lebih detail
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {booth.poster_url && (
                <img
                  src={booth.poster_url}
                  alt={`Poster ${booth.name}`}
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        <BoothCheckinDialog
          open={checkInDialogOpen}
          onOpenChange={setCheckInDialogOpen}
          question={randomQuestion}
          onSubmit={handleCheckInSubmit}
          isSubmitting={checkInMutation.isPending}
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
              {booth.name}
            </DrawerTitle>
            <DrawerDescription>
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[70vh]">
            {boothContent}
          </div>
          <DrawerFooter className="pt-4 border-t">
            <Button
              onClick={handleCheckInClick}
              className="w-full"
              disabled={hasCheckedIn}
            >
              <CheckCircle2 className="size-4 mr-2" />
              {hasCheckedIn ? 'Sudah Check-in' : 'Check-in Sekarang'}
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

      {/* Nested Poster Drawer */}
      <Drawer open={isPosterOpen} onOpenChange={setIsPosterOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Image className="size-5" />
              Poster {booth.name}
            </DrawerTitle>
            <DrawerDescription>
              Geser untuk menutup
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[75vh]">
            {booth.poster_url && (
              <img
                src={booth.poster_url}
                alt={`Poster ${booth.name}`}
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
          <DrawerFooter className="pt-4">
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
        question={randomQuestion}
        onSubmit={handleCheckInSubmit}
        isSubmitting={checkInMutation.isPending}
      />
    </>
  )
}

export default BoothDetailDialog
