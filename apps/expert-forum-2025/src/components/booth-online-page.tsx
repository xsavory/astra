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
    <div className="space-y-4 relative min-h-screen">
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
            Booth Online
          </h1>
          <p className="text-muted-foreground mt-2">
            Progress: {boothsCompleted} dari {totalBooths} booth selesai
          </p>
        </div>
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
                className={`cursor-pointer transition-all group ${
                  isCompleted
                    ? 'border-2 border-green-500/30 bg-gradient-to-br from-green-50/50 via-card to-green-500/5 dark:from-green-950/20 dark:via-card dark:to-green-500/10 shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20'
                    : 'border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/40'
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
                  <div className="relative aspect-video w-full mb-3 overflow-hidden rounded-lg bg-muted ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                    {boothVisualImage ? (
                      <img
                        src={boothVisualImage}
                        alt={booth.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/5 to-cyan-500/10">
                        <Building2 className="size-12 text-primary/40 group-hover:text-primary/60 transition-colors" />
                      </div>
                    )}
                    {/* Completed Badge Overlay */}
                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white border-0 shadow-lg">
                          <CheckCircle className="size-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Booth Info */}
                  <div className="space-y-2">
                    <CardTitle className="text-base sm:text-lg line-clamp-1 group-hover:text-primary transition-colors">
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
                        <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 shadow-sm">
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
                      <Badge variant="outline" className="text-muted-foreground border-dashed">
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
