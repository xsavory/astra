import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { QrCode, CheckCircle, Clock, ChevronRight } from 'lucide-react'

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
import type { User, BoothCheckin } from 'src/types/schema'

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
  const { data: boothCheckins = [], isLoading } = useQuery<BoothCheckin[]>({
    queryKey: ['boothCheckins', user.id],
    queryFn: () => api.checkins.getParticipantBoothCheckins(user.id),
  })

  // Show skeleton while loading
  if (isLoading) {
    return (
      <>
        <BoothOfflinePageSkeleton />
        {/* FAB - Always visible */}
        <Button
          size="lg"
          className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg"
          onClick={() => setIsScannerOpen(true)}
        >
          <QrCode className="size-6" />
        </Button>
      </>
    )
  }

  const boothsCompleted = boothCheckins.length

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Booth</h1>
        <p className="text-muted-foreground mt-1">
          Progress: {boothsCompleted} booth dikunjungi
        </p>
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
          {boothCheckins.map((checkin) => (
            <Card
              key={checkin.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                navigate({
                  to: '/participant/booth',
                  search: { booth_id: checkin.booth_id },
                })
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg mb-2">
                      {/* TODO: Display booth name from booth data */}
                      Booth {checkin.booth_id.slice(0, 8)}...
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
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                      <CheckCircle className="size-3 mr-1" />
                      Completed
                    </Badge>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
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
              replace: true,
            })
          }
        }}
      />
    </div>
  )
}

export default BoothOfflinePage
