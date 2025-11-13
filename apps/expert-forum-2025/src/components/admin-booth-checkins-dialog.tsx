/**
 * AdminBoothCheckinsDialog Component
 *
 * Clean and compact dialog for viewing booth checkins stats:
 * - List of all booths with checkins stats information
 * - Consistent with admin design system
 */

import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Card,
  CardContent,
  Badge,
  Skeleton,
  ScrollArea,
} from '@repo/react-components/ui'
import { QrCodeIcon, Users, UserCheck } from 'lucide-react'
import api from 'src/lib/api'

interface AdminBoothCheckinsDialogProps {
  open: boolean
  onClose: () => void
}

export function AdminBoothCheckinsDialog({
  open,
  onClose,
}: AdminBoothCheckinsDialogProps) {
  // Fetch booth checkins stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['boothCheckinsStats'],
    queryFn: () => api.checkins.getBoothCheckinsStats(),
    enabled: open,
    refetchInterval: 5000, // Auto refresh every 5 seconds
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5 text-primary" />
            Booth Checkins Statistics
          </DialogTitle>
          <DialogDescription className='text-left'>
            Real-time statistics of booth check-ins by participant type
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-8rem)] pr-4">
          <div className="space-y-3">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : stats && stats.length > 0 ? (
              // Booth stats list
              stats.map((booth) => (
                <Card key={booth.booth_id} className="hover:bg-accent/50 transition-colors">
                  <CardContent>
                    <div className="flex items-center justify-between gap-4">
                      {/* Booth info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs font-mono">
                            #{booth.booth_order}
                          </Badge>
                          <h4 className="font-semibold text-sm truncate">
                            {booth.booth_name}
                          </h4>
                        </div>

                        {/* Stats breakdown */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>Online: <span className="font-semibold text-foreground">{booth.online_checkins}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Offline: <span className="font-semibold text-foreground">{booth.offline_checkins}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Total count badge */}
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          Total
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          {booth.total_checkins}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Empty state
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <QrCodeIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No booth check-ins recorded yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default AdminBoothCheckinsDialog
