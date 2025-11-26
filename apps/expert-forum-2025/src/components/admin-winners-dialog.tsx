/**
 * AdminWinnersDialog Component
 *
 * Dialog for viewing all winner submissions:
 * 1. Grid of winner cards showing title, company case, creator
 * 2. Click card to view detailed submission information
 * 3. Back button to return to winners list
 *
 * Features:
 * - Read-only view of winners
 * - Card-based layout for better visual organization
 * - Expandable detail view within same dialog
 * - Empty state when no winners selected yet
 *
 * @see AdminSubmissionDrawer for submission management
 */

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  toast,
} from '@repo/react-components/ui'
import {
  ChevronLeft,
  Trophy,
  Users as UsersIcon,
  User as UserIcon,
  Lightbulb,
  XCircle,
} from 'lucide-react'
import api from 'src/lib/api'
import type { Ideation, User } from 'src/types/schema'

interface AdminWinnersDialogProps {
  open: boolean
  onClose: () => void
}

type IdeationWithCreator = Ideation & { creator: User }

function AdminWinnersDialog({ open, onClose }: AdminWinnersDialogProps) {
  // State for selected winner to view details
  const [selectedWinner, setSelectedWinner] = useState<IdeationWithCreator | null>(null)
  const [winnerDetails, setWinnerDetails] = useState<{
    ideation: Ideation
    creator: User
    participants?: User[]
  } | null>(null)

  // State for confirmation dialog
  const [confirmRemove, setConfirmRemove] = useState<{
    open: boolean
    ideationId: string
  }>({
    open: false,
    ideationId: '',
  })

  // Query client for invalidation
  const queryClient = useQueryClient()

  // Fetch all winners
  const { data: winners, isLoading: isLoadingWinners } = useQuery({
    queryKey: ['winners'],
    queryFn: () => api.ideations.getWinners(),
    enabled: open,
  })

  // Fetch winner details when selected
  const { data: detailsData, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['winnerDetails', selectedWinner?.id],
    queryFn: () => api.ideations.getIdeationWithDetails(selectedWinner!.id),
    enabled: !!selectedWinner,
  })

  // Update details state when data changes
  useMemo(() => {
    if (detailsData) {
      setWinnerDetails(detailsData)
    }
  }, [detailsData])

  // Mutation for removing winner
  const unselectWinnerMutation = useMutation({
    mutationFn: (ideationId: string) => api.ideations.unselectAsWinner(ideationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['winners'] })
      queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] })
      queryClient.invalidateQueries({ queryKey: ['submissionDetails'] })
      toast.success('Submission removed from winners')
      // Go back to list after removing
      handleBackToList()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove submission from winners')
    },
  })

  // Handle card click to view details
  const handleCardClick = (winner: IdeationWithCreator) => {
    setSelectedWinner(winner)
  }

  // Handle back to list
  const handleBackToList = () => {
    setSelectedWinner(null)
    setWinnerDetails(null)
  }

  // Handle remove winner button click
  const handleRemoveWinner = (ideationId: string) => {
    setConfirmRemove({
      open: true,
      ideationId,
    })
  }

  // Handle confirm remove
  const handleConfirmRemove = () => {
    unselectWinnerMutation.mutate(confirmRemove.ideationId)
    setConfirmRemove({ open: false, ideationId: '' })
  }

  // Handle cancel remove
  const handleCancelRemove = () => {
    setConfirmRemove({ open: false, ideationId: '' })
  }

  // Handle dialog close
  const handleClose = () => {
    onClose()
    setSelectedWinner(null)
    setWinnerDetails(null)
  }

  // Format date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl! max-h-[90vh] overflow-y-auto">
        {!selectedWinner ? (
          <>
            {/* List View */}
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Submission Winners
              </DialogTitle>
              <DialogDescription className='text-left'>
                {winners?.length || 0} submission(s) selected as winners
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {isLoadingWinners ? (
                <p className="text-center py-8 text-muted-foreground">Loading winners...</p>
              ) : winners && winners.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {winners.map((winner) => (
                    <Card
                      key={winner.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-primary/20"
                      onClick={() => handleCardClick(winner)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-semibold line-clamp-2">
                            {winner.title}
                          </CardTitle>
                          <Badge variant="default" className="shrink-0">
                            <Trophy className="h-3 w-3 mr-1" />
                            Winner
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Company Case</span>
                          <span className="font-medium">{winner.company_case}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Creator</span>
                          <span className="font-medium">{winner.creator.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Type</span>
                          <Badge variant={winner.is_group ? 'default' : 'secondary'} className="h-6">
                            {winner.is_group ? (
                              <>
                                <UsersIcon className="h-3 w-3 mr-1" />
                                Group
                              </>
                            ) : (
                              <>
                                <UserIcon className="h-3 w-3 mr-1" />
                                Individual
                              </>
                            )}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <div>
                    <p className="text-lg font-medium">No Winners Yet</p>
                    <p className="text-sm text-muted-foreground">
                      Select submissions as winners from the submission management drawer
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Detail View */}
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBackToList}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
              <DialogTitle className="flex items-center gap-2 justify-between">
                <div className='flex gap-2 items-center justify-end'>
                  <Lightbulb className="h-5 w-5" />
                  {selectedWinner.title}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveWinner(winnerDetails?.ideation.id as string)}
                  disabled={unselectWinnerMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Remove from Winners
                </Button>
              </DialogTitle>
              <DialogDescription className='text-left'>
                Winner Submission by <span className='font-semibold'>{selectedWinner.creator.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {isDetailsLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading details...</p>
              ) : winnerDetails ? (
                <>
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="default">
                          <Trophy className="h-3 w-3 mr-1" />
                          Winner
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <Badge variant={winnerDetails.ideation.is_group ? 'default' : 'secondary'}>
                          {winnerDetails.ideation.is_group ? (
                            <>
                              <UsersIcon className="h-3 w-3 mr-1" />
                              Group
                            </>
                          ) : (
                            <>
                              <UserIcon className="h-3 w-3 mr-1" />
                              Individual
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Company Case</span>
                        <span className="text-sm font-medium">
                          {winnerDetails.ideation.company_case}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Submitted</span>
                        <span className="text-sm font-medium">
                          {winnerDetails.ideation.submitted_at
                            ? formatDateTime(winnerDetails.ideation.submitted_at)
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {winnerDetails.ideation.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Creator */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Creator</h3>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{winnerDetails.creator.name}</p>
                      <p className="text-sm text-muted-foreground">{winnerDetails.creator.email}</p>
                      {winnerDetails.creator.company && (
                        <p className="text-sm text-muted-foreground">
                          {winnerDetails.creator.company}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Group Members (if group submission) */}
                  {winnerDetails.ideation.is_group && winnerDetails.participants && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">
                          Group Members ({winnerDetails.participants.length})
                        </h3>
                        <div className="space-y-2">
                          {winnerDetails.participants.map((participant) => (
                            <div
                              key={participant.id}
                              className="p-3 rounded-lg border bg-card space-y-1"
                            >
                              <p className="text-sm font-medium">{participant.name}</p>
                              <p className="text-xs text-muted-foreground">{participant.email}</p>
                              {participant.company && (
                                <p className="text-xs text-muted-foreground">{participant.company}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>
          </>
        )}
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmRemove.open}
        onOpenChange={(open) => {
          if (!open) handleCancelRemove()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Winners?</AlertDialogTitle>
            <AlertDialogDescription>
              This submission will be removed from the winners list. You can select it again later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRemove}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

export default AdminWinnersDialog
