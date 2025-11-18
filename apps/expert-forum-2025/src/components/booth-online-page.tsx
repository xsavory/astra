import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle, Building2, Clock, ArrowLeft, ChevronDown, Circle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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
  const [isProgressOpen, setIsProgressOpen] = useState(false)

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
        variant="outline"
        size="sm"
        className="mb-2 hover:bg-primary/10"
        onClick={() => navigate({ to: '/participant' })}
      >
        <ArrowLeft className="size-4 mr-2" />
        Back
      </Button>

      {/* Header with gradient background */}
      <Collapsible open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <Card className="gap-2 py-3 relative overflow-hidden border-primary/20 shadow-lg shadow-primary/10 bg-gradient-to-br from-primary/10 via-blue-500/5 to-cyan-500/10">
          <CardHeader className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent mb-2">
                  Booth Online
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Progress: <span className='font-bold text-foreground'>{boothsCompleted}</span> of <span className='font-bold text-foreground'>{totalBooths}</span> booth{totalBooths > 1 ? 's' : ''} completed
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  variant='outline'
                  size="sm"
                  className="hover:bg-primary/10"
                >
                  <ChevronDown
                    className={`size-5 transition-transform duration-200 ${
                      isProgressOpen ? 'rotate-180' : ''
                    }`}
                  />
                  <span className="sr-only">Toggle progress details</span>
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="relative pt-0 space-y-2">
              <div className="border-t border-primary/10 pt-4">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Booth List
                </h3>
                <div className="space-y-2">
                  {booths.map((booth) => {
                    const isCompleted = boothCheckinMap.has(booth.id)
                    const checkin = boothCheckinMap.get(booth.id)

                    return (
                      <div
                        key={booth.id}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100/50 dark:hover:bg-green-900/30'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          navigate({
                            to: '/participant/booth',
                            search: { booth_id: booth.id },
                            resetScroll: false,
                          })
                          setIsProgressOpen(false)
                        }}
                      >
                        <div className="mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium line-clamp-1 ${
                            isCompleted
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-muted-foreground'
                          }`}>
                            {booth.name}
                          </p>
                          {isCompleted && checkin && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="size-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(checkin.checkin_time).toLocaleString('en-US', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Empty State - No booths available */}
      {totalBooths === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="rounded-full bg-muted p-4">
                <Building2 className="size-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">No booths available yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Booths are not available at this time. Please check back later.
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
                      {booth.description || 'Click to view booth details'}
                    </CardDescription>
                  </div>

                  {/* Status Badge and Checkin Time */}
                  <div className="mt-2 space-y-2">
                    {isCompleted ? (
                      <>
                        <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900/50 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 shadow-sm">
                          <CheckCircle className="size-3 mr-1" />
                          Already visited
                        </Badge>
                        {checkin && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            <span>
                              {new Date(checkin.checkin_time).toLocaleString('en-US', {
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
                        Not visited yet
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
