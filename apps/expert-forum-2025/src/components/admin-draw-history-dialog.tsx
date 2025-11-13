/**
 * AdminDrawHistoryDialog Component
 *
 * Clean and compact dialog for viewing draw history:
 * - List of all draws with prize template info
 * - Winners displayed in compact grid
 * - Staff info and timestamps
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
} from '@repo/react-components/ui'
import { Trophy } from 'lucide-react'
import api from 'src/lib/api'
import type { DrawLogWithDetails } from 'src/types/schema'

interface AdminDrawHistoryDialogProps {
  open: boolean
  onClose: () => void
}

export function AdminDrawHistoryDialog({
  open,
  onClose,
}: AdminDrawHistoryDialogProps) {
  // Fetch draw history
  const { data: drawHistory = [], isLoading } = useQuery<DrawLogWithDetails[]>({
    queryKey: ['admin-draw-history'],
    queryFn: () => api.draws.getDrawHistory(),
    enabled: open, // Only fetch when dialog is open
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Draw History
          </DialogTitle>
          <DialogDescription>
            Total {drawHistory.length} draws conducted
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : drawHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No draws yet</p>
              <p className="text-sm">Draw history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drawHistory.map((draw, index) => (
                <Card key={draw.id} className="border border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="font-mono">
                            #{drawHistory.length - index}
                          </Badge>
                          {draw.prize_name && (
                            <Badge className="bg-primary">
                              {draw.prize_name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(draw.created_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                        {draw.staff && (
                          <p className="text-xs text-muted-foreground">
                            Staff: {draw.staff.name}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {draw.winners?.length || 0} Winner{(draw.winners?.length || 0) !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {draw.winners && draw.winners.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                        {draw.winners.map((winner) => (
                          <div
                            key={winner.id}
                            className="p-2 bg-muted/50 rounded-md border border-border"
                          >
                            <p className="font-medium text-sm truncate">{winner.name}</p>
                            {winner.company && (
                              <p className="text-xs text-muted-foreground truncate">
                                {winner.company}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AdminDrawHistoryDialog
