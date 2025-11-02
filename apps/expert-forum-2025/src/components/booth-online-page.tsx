import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle, Building2, Clock, ArrowLeft } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Button,
} from '@repo/react-components/ui'
import BoothDetailDialog from './booth-detail-dialog'
import api from 'src/lib/api'
import { getBoothVisualImage } from 'src/lib/utils'
import type { User, Booth, BoothCheckin } from 'src/types/schema'

interface BoothOnlinePageProps {
  user: User
}

// Skeleton Loading Component
function BoothOnlinePageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Booth Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-40 w-full rounded-lg mb-3" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

function BoothOnlinePage({ user }: BoothOnlinePageProps) {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { booth_id?: string }

  // Fetch all booths
  const { data: booths = [], isLoading: isLoadingBooths } = useQuery<Booth[]>({
    queryKey: ['booths'],
    queryFn: () => api.booths.getBooths(),
  })

  // Fetch booth checkins for current user
  const { data: boothCheckins = [], isLoading: isLoadingCheckins } = useQuery<BoothCheckin[]>({
    queryKey: ['boothCheckins', user.id],
    queryFn: () => api.checkins.getParticipantBoothCheckins(user.id),
  })

  const isLoading = isLoadingBooths || isLoadingCheckins

  // Show skeleton while loading
  if (isLoading) {
    return <BoothOnlinePageSkeleton />
  }

  // Create a map of booth ID to checkin data for quick lookup (to show checkin time)
  const boothCheckinMap = new Map(boothCheckins.map((checkin) => [checkin.booth_id, checkin]))

  // Calculate progress
  const boothsCompleted = boothCheckins.length
  const totalBooths = booths.length

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="secondary"
        size="sm"
        className="mb-2 -ml-2"
        onClick={() => navigate({ to: '/participant' })}
      >
        <ArrowLeft className="size-4 mr-2" />
        Kembali
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Booth</h1>
        <p className="text-muted-foreground mt-1">
          Progress: {boothsCompleted} dari {totalBooths} booth selesai
        </p>
      </div>

      {/* Empty State - No booths available */}
      {totalBooths === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="rounded-full bg-muted p-4">
                <Building2 className="size-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Belum ada booth tersedia</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Booth belum tersedia saat ini. Silakan cek kembali nanti.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booth Grid */}
      {totalBooths > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {booths.map((booth) => {
            const checkin = boothCheckinMap.get(booth.id)
            const isCompleted = !!checkin
            const boothVisualImage = getBoothVisualImage(booth.id)

            return (
              <Card
                key={booth.id}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  isCompleted
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => {
                  navigate({
                    to: '/participant/booth',
                    search: { booth_id: booth.id },
                    resetScroll: false,
                  })
                }}
              >
                <CardHeader className="pb-3">
                  {/* Booth Visual Image */}
                  <div className="relative aspect-video w-full mb-3 overflow-hidden rounded-lg bg-muted">
                    {boothVisualImage ? (
                      <img
                        src={boothVisualImage}
                        alt={booth.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Building2 className="size-12 text-muted-foreground" />
                      </div>
                    )}
                    {/* Completed Badge Overlay */}
                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600 hover:bg-green-600 text-white border-0 shadow-md">
                          <CheckCircle className="size-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Booth Info */}
                  <div className="space-y-2">
                    <CardTitle className="text-base sm:text-lg line-clamp-1">
                      {booth.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                      {booth.description || 'Klik untuk melihat detail booth'}
                    </CardDescription>
                  </div>

                  {/* Status Badge and Checkin Time */}
                  <div className="mt-2 space-y-2">
                    {isCompleted ? (
                      <>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                          <CheckCircle className="size-3 mr-1" />
                          Sudah dikunjungi
                        </Badge>
                        {checkin && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            <span>
                              {new Date(checkin.checkin_time).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Belum dikunjungi
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}

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

export default BoothOnlinePage
