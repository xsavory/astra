/**
 * AdminBoothVotesResult Component
 *
 * Clean and compact dialog for viewing booth votes result:
 * - Booth votes result data with rankings
 * - Final vote counts and submission info
 * - Consistent with admin design system
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Alert,
  AlertDescription,
  Switch,
  Label,
} from '@repo/react-components/ui'
import { Trophy, Medal, Award, AlertCircle, Clock, Lock } from 'lucide-react'
import { toast } from '@repo/react-components/ui'
import api from 'src/lib/api'
import type { BoothVoteResultWithDetails } from 'src/types/schema'

interface AdminBoothVotesResultProps {
  open: boolean
  onClose: () => void
}

// Skeleton loader for result items
function ResultItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminBoothVotesResult({
  open,
  onClose,
}: AdminBoothVotesResultProps) {
  const queryClient = useQueryClient()

  // Fetch current event
  const { data: event } = useQuery({
    queryKey: ['current-event'],
    queryFn: () => api.events.getEvent(),
    enabled: open,
  })

  // Fetch final results
  const {
    data: results = [],
    isLoading,
    error,
  } = useQuery<BoothVoteResultWithDetails[]>({
    queryKey: ['booth-votes-results', event?.id],
    queryFn: () => {
      if (!event?.id) throw new Error('No active event')
      return api.voteResults.getFinalResults(event.id)
    },
    enabled: open && !!event?.id,
  })

  // Calculate total votes from results
  const totalVotes = results.reduce((sum, result) => sum + result.final_vote_count, 0)
  // Calculate total voters (each voter votes for 2 booths)
  const totalVoters = totalVotes > 0 ? Math.floor(totalVotes / 2) : 0

  // Mutation to toggle voting open status
  const toggleVotesOpenMutation = useMutation({
    mutationFn: async (isOpen: boolean) => {
      if (!event?.id) throw new Error('No active event')
      await api.events.updateVotesOpen(event.id, isOpen)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-event'] })
      queryClient.invalidateQueries({ queryKey: ['votingState'] })
      toast.success('Voting status updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update voting status')
    },
  })

  // Medal colors for top 3
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600'
      case 2:
        return 'text-gray-500'
      case 3:
        return 'text-orange-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const getMedalBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 dark:bg-yellow-950'
      case 2:
        return 'bg-gray-100 dark:bg-gray-800'
      case 3:
        return 'bg-orange-100 dark:bg-orange-950'
      default:
        return 'bg-muted'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Booth Votes Result
              </DialogTitle>
              <DialogDescription className='text-left'>
                Final voting results snapshot - Rankings and vote counts
              </DialogDescription>
            </div>

            {/* Toggle for voting open status */}
            {event && !event.is_votes_lock && (
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="votes-open-toggle"
                  className="text-sm font-medium cursor-pointer"
                >
                  Voting Open
                </Label>
                <Switch
                  id="votes-open-toggle"
                  checked={event.is_votes_open}
                  onCheckedChange={(checked) => toggleVotesOpenMutation.mutate(checked)}
                  disabled={toggleVotesOpenMutation.isPending}
                />
              </div>
            )}

            {/* Show lock badge if voting is locked */}
            {event?.is_votes_lock && (
              <Badge variant="secondary" className="shrink-0">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
          {/* Loading state */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <ResultItemSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load results'}
              </AlertDescription>
            </Alert>
          )}

          {/* No results state */}
          {!isLoading && !error && results.length === 0 && (
            <div className="space-y-4">
              {event?.is_votes_lock ? (
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    No voting results found. Results may have been cleared or not yet submitted.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Voting results have not been finalized yet. Results will appear here once the voting is locked.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Results list */}
          {!isLoading && !error && results.length > 0 && results[0] && (
            <div className="space-y-3">
              {/* Summary info */}
              <Card className="p-2 bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  {/* Finalization date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>
                      Results finalized on {new Date(results[0].submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Badge className="px-3 py-1 font-bold">
                        <Award className="h-3 w-3 mr-1" />
                        {totalVoters} {totalVoters === 1 ? 'Voter' : 'Voters'}
                      </Badge>
                      <Badge className="px-3 py-1 font-bold">
                        <Trophy className="h-3 w-3 mr-1" />
                        {totalVotes} {totalVotes === 1 ? 'Vote' : 'Votes'}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                      {results.length} {results.length === 1 ? 'Booth' : 'Booths'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Results cards */}
              {results.map((result) => (
                <Card
                  key={result.id}
                  className={`transition-colors ${result.final_rank <= 3 ? 'border-2' : ''} ${
                    result.final_rank === 1
                      ? 'border-yellow-500/50'
                      : result.final_rank === 2
                        ? 'border-gray-400/50'
                        : result.final_rank === 3
                          ? 'border-orange-500/50'
                          : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank badge */}
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full font-bold text-lg ${getMedalBgColor(result.final_rank)}`}
                      >
                        {result.final_rank <= 3 ? (
                          result.final_rank === 1 ? (
                            <Trophy className={`h-5 w-5 ${getMedalColor(result.final_rank)}`} />
                          ) : (
                            <Medal className={`h-5 w-5 ${getMedalColor(result.final_rank)}`} />
                          )
                        ) : (
                          <span className="text-muted-foreground">#{result.final_rank}</span>
                        )}
                      </div>

                      {/* Booth info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base truncate">
                          {result.booth?.name || 'Unknown Booth'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Rank #{result.final_rank}
                        </p>
                      </div>

                      {/* Vote count badge */}
                      <Badge variant="default" className="shrink-0 text-base px-3 py-1">
                        <Award className="h-4 w-4 mr-1" />
                        {result.final_vote_count} {result.final_vote_count === 1 ? 'Vote' : 'Votes'}
                      </Badge>
                    </div>
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

export default AdminBoothVotesResult
