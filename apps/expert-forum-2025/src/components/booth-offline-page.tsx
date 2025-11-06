import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { QrCode, CheckCircle, Clock, ChevronRight, ArrowLeft } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
} from '@repo/react-components/ui'
import BoothQRScannerDialog from './booth-qr-scanner-dialog'
import BoothDetailDialog from './booth-detail-dialog'
import api from 'src/lib/api'
import type { User, BoothCheckin, Booth } from 'src/types/schema'

interface BoothOfflinePageProps {
  user: User
}

// Skeleton Loading Component
function BoothOfflinePageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Booth Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BoothOfflinePage({ user }: BoothOfflinePageProps) {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { booth_id?: string }
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  // Fetch booth checkins for current user
  const { data: boothCheckins = [], isLoading: isLoadingCheckins } = useQuery<BoothCheckin[]>({
    queryKey: ['boothCheckins', user.id],
    queryFn: () => api.checkins.getParticipantBoothCheckins(user.id),
  })

  // Fetch all booths to get booth details
  const { data: booths = [], isLoading: isLoadingBooths } = useQuery<Booth[]>({
    queryKey: ['booths'],
    queryFn: () => api.booths.getBooths(),
  })

  const isLoading = isLoadingCheckins || isLoadingBooths

  // Show skeleton while loading
  if (isLoading) {
    return (
      <>
        <BoothOfflinePageSkeleton />
        {/* FAB - Always visible */}
        <Button
          size="lg"
          className="fixed bottom-6 right-6 size-14 rounded-full shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 z-50 bg-gradient-to-r from-primary via-blue-600 to-cyan-500 hover:from-primary/90 hover:via-blue-600/90 hover:to-cyan-500/90 border-2 border-white/20 hover:border-white/40 hover:scale-110"
          onClick={() => setIsScannerOpen(true)}
        >
          <QrCode className="size-6" />
        </Button>
      </>
    )
  }

  // Create a map of booth ID to booth data for quick lookup
  const boothMap = new Map(booths.map((booth) => [booth.id, booth]))

  // Create a map of booth ID to checkin data for quick lookup
  const boothCheckinMap = new Map(boothCheckins.map((checkin) => [checkin.booth_id, checkin]))

  const boothsCompleted = boothCheckins.length

  return (
    <div className="space-y-4 pb-24 relative min-h-screen">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-2 -ml-2 hover:bg-primary/10"
        onClick={() => navigate({ to: '/participant' })}
      >
        <ArrowLeft className="size-4 mr-2" />
        Kembali
      </Button>

      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-blue-500/5 to-cyan-500/10 p-6 border border-primary/20 shadow-lg shadow-primary/10">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
            Booth Offline
          </h1>
          <p className="text-muted-foreground mt-2">
            Progress: {boothsCompleted} booth dikunjungi
          </p>
        </div>
      </div>

      {/* Empty State */}
      {boothsCompleted === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="rounded-full bg-muted p-4">
                <QrCode className="size-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Belum ada booth yang dikunjungi</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Klik tombol scan di bawah untuk mulai mengunjungi booth dan menjawab pertanyaan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booth Checkins List */}
      {boothsCompleted > 0 && (
        <div className="space-y-3">
          {boothCheckins.map((checkin) => {
            const booth = boothMap.get(checkin.booth_id)

            return (
              <Card
                key={checkin.id}
                className="cursor-pointer transition-all group border-2 border-green-500/30 bg-gradient-to-br from-green-50/50 via-card to-green-500/5 dark:from-green-950/20 dark:via-card dark:to-green-500/10 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20 hover:border-green-500/50"
                onClick={() => {
                  navigate({
                    to: '/participant/booth',
                    search: { booth_id: checkin.booth_id },
                    resetScroll: false,
                  })
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {booth?.name || `Booth ${checkin.booth_id.slice(0, 8)}...`}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span>
                          {new Date(checkin.checkin_time).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 shadow-sm">
                        <CheckCircle className="size-3 mr-1" />
                        Completed
                      </Badge>
                      <ChevronRight className="size-5 text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 size-14 rounded-full transition-all duration-300 z-50 bg-gradient-to-r from-primary via-blue-600 to-cyan-500 hover:from-primary/90 hover:via-blue-600/90 hover:to-cyan-500/90 border-2 border-blue-100 hover:border-white/40 hover:scale-110"
        onClick={() => setIsScannerOpen(true)}
      >
        <QrCode className="size-6" />
        <span className="sr-only">Scan Booth QR Code</span>
      </Button>

      {/* QR Scanner Dialog */}
      <BoothQRScannerDialog
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
      />

      {/* Booth Detail Dialog - Controlled by URL query params */}
      <BoothDetailDialog
        open={!!searchParams.booth_id}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Clear booth_id when closing
            navigate({
              to: '/participant/booth',
              search: {},
              resetScroll: false,
            })
          }
        }}
        user={user}
        existingCheckin={searchParams.booth_id ? boothCheckinMap.get(searchParams.booth_id) : null}
      />
    </div>
  )
}

export default BoothOfflinePage
