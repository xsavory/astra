import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Lightbulb, Building2, Calendar, X, Loader2 } from 'lucide-react'

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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import api from 'src/lib/api'
import type { Ideation } from 'src/types/schema'

interface IdeationDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function IdeationDetailDialog({ open, onOpenChange }: IdeationDetailDialogProps) {
  const isMobile = useIsMobile()
  const searchParams = useSearch({ strict: false }) as { ideation_id?: string }

  // Fetch ideation data based on ideation_id from URL
  const { data: ideation, isLoading } = useQuery<Ideation>({
    queryKey: ['ideation', searchParams.ideation_id],
    queryFn: () => api.ideations.getIdeation(searchParams.ideation_id!),
    enabled: !!searchParams.ideation_id && open,
  })

  // Ideation content component - Memoized to prevent unnecessary re-renders
  const ideationContent = useMemo(() => {
    if (!ideation) return null

    return (
      <div className="space-y-4">
        {/* Company Case Badge */}
        <div>
          <Badge variant="outline" className="text-sm">
            <Building2 className="size-3 mr-1" />
            {ideation.company_case}
          </Badge>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Judul Ideation</h3>
          <p className="text-base">{ideation.title}</p>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deskripsi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {ideation.description}
            </div>
          </CardContent>
        </Card>

        {/* Submission Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <Calendar className="size-3" />
          <span>
            Submitted: {new Date(ideation.submitted_at || ideation.created_at).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    )
  }, [ideation])

  // Show loading state
  if (isLoading) {
    if (!isMobile) {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="size-5" />
                Loading...
              </DialogTitle>
              <DialogDescription>
                Memuat detail ideation
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Memuat detail ideation...</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )
    }

    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="min-h-[400px]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Lightbulb className="size-5" />
              Loading...
            </DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="px-4 pb-4 flex-1">
            <div className="py-4">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Memuat detail ideation...</p>
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-4 border-t">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                <X className="size-4 mr-2" />
                Tutup
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  // Render Dialog for desktop
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="size-5" />
              Detail Ideation
            </DialogTitle>
            <DialogDescription>
              Ideation yang telah Anda submit
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {ideationContent}
          </div>
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
            <Lightbulb className="size-5" />
            Detail Ideation
          </DrawerTitle>
          <DrawerDescription>
            Ideation yang telah Anda submit
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto max-h-[70vh]">
          {ideationContent}
        </div>
        <DrawerFooter className="pt-4 border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              <X className="size-4 mr-2" />
              Tutup
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default IdeationDetailDialog
