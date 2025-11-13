import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Award, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'

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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Button,
  Alert,
  AlertDescription,
  Checkbox,
  Label,
  Skeleton,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import api from 'src/lib/api'
import type { User, Booth, BoothVoteWithBooth } from 'src/types/schema'

interface BoothVotingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

// Skeleton Loading Component
function VotingContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

function BoothVotingDialog({ open, onOpenChange, user }: BoothVotingDialogProps) {
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [selectedBoothIds, setSelectedBoothIds] = useState<string[]>([])

  // Reset selections when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedBoothIds([])
    }
  }, [open])

  // Fetch all booths
  const {
    data: booths = [],
    isLoading: isLoadingBooths,
    error: boothsError,
  } = useQuery<Booth[]>({
    queryKey: ['booths'],
    queryFn: () => api.booths.getBooths(),
    enabled: open,
  })

  // Fetch user's existing votes
  const {
    data: userVotes = [],
    isLoading: isLoadingVotes,
    error: votesError,
  } = useQuery<BoothVoteWithBooth[]>({
    queryKey: ['userVotes', user.id],
    queryFn: () => api.votes.getUserVotes(user.id),
    enabled: open,
  })

  // Submit votes mutation
  const submitVotesMutation = useMutation({
    mutationFn: (boothIds: [string, string]) =>
      api.votes.submitVotes(user.id, { booth_ids: boothIds }),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['userVotes', user.id] })
      setSelectedBoothIds([])
    },
  })

  const isLoading = isLoadingBooths || isLoadingVotes
  const hasVoted = userVotes.length > 0
  const error = boothsError || votesError

  // Handle checkbox change
  const handleToggleBooth = (boothId: string) => {
    setSelectedBoothIds((prev) => {
      if (prev.includes(boothId)) {
        // Remove if already selected
        return prev.filter((id) => id !== boothId)
      } else {
        // Add if not at limit
        if (prev.length < 2) {
          return [...prev, boothId]
        }
        return prev
      }
    })
  }

  // Handle submit
  const handleSubmit = () => {
    if (selectedBoothIds.length === 2) {
      submitVotesMutation.mutate(selectedBoothIds as [string, string])
    }
  }

  // Content component to be reused in both Dialog and Drawer
  const VotingContent = () => {
    // Loading state
    if (isLoading) {
      return <VotingContentSkeleton />
    }

    // Error state
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load voting data. Please try again.'}
          </AlertDescription>
        </Alert>
      )
    }

    // Completed state - User has already voted
    if (hasVoted) {
      return (
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-green-500/15 to-emerald-500/10 p-4 border-2 border-green-500/40 shadow-lg shadow-green-500/20">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/20 p-2">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Vote Submitted Successfully
                </p>
                <p className="text-xs text-green-600/80 dark:text-green-400/80">
                  You have already submitted your votes
                </p>
              </div>
            </div>
          </div>

          {/* Display voted booths */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Your Votes:</h4>
            {userVotes.map((vote) => (
              <div
                key={vote.id}
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-green-500/30 bg-green-500/5"
              >
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0" />
                <span className="font-medium">{vote.booth?.name || 'Unknown Booth'}</span>
              </div>
            ))}
          </div>

          {/* Info message */}
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">
              Votes are final and cannot be changed once submitted
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    // Voting state - Allow user to select booths
    return (
      <div className="space-y-4">
        {/* Selection counter */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Selected:</span>
          <span className={`font-bold ${selectedBoothIds.length === 2 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            {selectedBoothIds.length} of 2
          </span>
        </div>

        {/* Booth list */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {booths.map((booth) => {
            const isSelected = selectedBoothIds.includes(booth.id)
            const isDisabled = !isSelected && selectedBoothIds.length >= 2

            return (
              <div
                key={booth.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : isDisabled
                      ? 'border-border bg-muted/30 opacity-50'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  id={`booth-${booth.id}`}
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={() => handleToggleBooth(booth.id)}
                />
                <Label
                  htmlFor={`booth-${booth.id}`}
                  className={`flex-1 cursor-pointer font-medium ${isDisabled ? 'cursor-not-allowed' : ''}`}
                >
                  {booth.name}
                </Label>
              </div>
            )
          })}
        </div>

        {/* Mutation error */}
        {submitVotesMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-sm">
              {submitVotesMutation.error instanceof Error
                ? submitVotesMutation.error.message
                : 'Failed to submit votes. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Render Dialog for desktop, Drawer for mobile
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="size-5" />
              Booth Voting
            </DialogTitle>
            <DialogDescription>
              Vote for your favorite booths at Expert Forum 2025
            </DialogDescription>
          </DialogHeader>
          <VotingContent />
          {/* Submit button in footer - only show when voting (not loading, error, or already voted) */}
          {!isLoading && !error && !hasVoted && (
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button
                size="lg"
                className="w-full"
                disabled={selectedBoothIds.length !== 2 || submitVotesMutation.isPending}
                onClick={handleSubmit}
              >
                {submitVotesMutation.isPending ? (
                  <>
                    <Loader2 className="size-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Award className="size-5 mr-2" />
                    Submit Votes
                  </>
                )}
              </Button>
            </div>
          )}
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
            <Award className="size-5" />
            Booth Voting
          </DrawerTitle>
          <DrawerDescription>
            Vote for your favorite booths at Expert Forum 2025
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto max-h-[60vh]">
          <VotingContent />
        </div>
        <DrawerFooter className="pt-2">
          {/* Submit button - only show when voting (not loading, error, or already voted) */}
          {!isLoading && !error && !hasVoted && (
            <Button
              size="lg"
              className="w-full"
              disabled={selectedBoothIds.length !== 2 || submitVotesMutation.isPending}
              onClick={handleSubmit}
            >
              {submitVotesMutation.isPending ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Award className="size-5 mr-2" />
                  Submit Votes
                </>
              )}
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline" size="sm">
              <X className="size-4 mr-2" />
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default BoothVotingDialog
