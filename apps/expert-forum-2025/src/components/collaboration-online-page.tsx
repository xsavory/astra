import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Lightbulb, Building2, Clock, ArrowLeft, Plus } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Button,
  toast,
} from '@repo/react-components/ui'
import IdeationDetailDialog from './ideation-detail-dialog'
import IdeationOnlineSubmissionDialog from './ideation-online-submission-dialog'
import api from 'src/lib/api'
import type { User, Ideation } from 'src/types/schema'

interface CollaborationOnlinePageProps {
  user: User
}

// Skeleton Loading Component
function CollaborationOnlinePageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Ideation Grid Skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-40 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CollaborationOnlinePage({ user }: CollaborationOnlinePageProps) {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { ideation_id?: string }
  const queryClient = useQueryClient()

  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false)

  // Fetch ideations for current user
  const { data: ideations = [], isLoading } = useQuery<Ideation[]>({
    queryKey: ['ideations', user.id],
    queryFn: () => api.ideations.getIdeationsByCreator(user.id),
  })

  // Create ideation mutation
  const createIdeationMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; company_case: string }) => {
      return api.ideations.createIndividualIdeation(user.id, data)
    },
    onSuccess: () => {
      // Invalidate queries to refresh ideations data
      queryClient.invalidateQueries({ queryKey: ['ideations', user.id] })

      // Show success toast
      toast.success('Ideation submitted successfully!')

      // Close submission dialog
      setSubmissionDialogOpen(false)
    },
    onError: (error) => {
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting ideation'
      toast.warning(errorMessage)
    },
  })

  // Show skeleton while loading
  if (isLoading) {
    return <CollaborationOnlinePageSkeleton />
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Back Button */}
      <Button
        variant="secondary"
        size="sm"
        className="mb-2 -ml-2"
        onClick={() => navigate({ to: '/participant' })}
      >
        <ArrowLeft className="size-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Collaboration</h1>
        <p className="text-muted-foreground mt-1">
          Submit innovation ideas or improvements for various company cases
        </p>
      </div>

      {/* Empty State - No ideations submitted yet */}
      {ideations.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="rounded-full bg-muted p-4">
                <Lightbulb className="size-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">No ideations yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  You haven't submitted any ideations yet. Click the "+" button below to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ideation List */}
      {ideations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total: {ideations.length} ideation{ideations.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {ideations.map((ideation) => (
              <Card
                key={ideation.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                onClick={() => {
                  navigate({
                    to: '/participant/collaboration',
                    search: { ideation_id: ideation.id },
                    resetScroll: false,
                  })
                }}
              >
                <CardHeader className="pb-3">
                  {/* Company Case Badge */}
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      <Building2 className="size-3 mr-1" />
                      {ideation.company_case}
                    </Badge>
                  </div>

                  {/* Ideation Title */}
                  <CardTitle className="text-base sm:text-lg line-clamp-2">
                    {ideation.title}
                  </CardTitle>

                  {/* Description Preview */}
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                    {ideation.description}
                  </CardDescription>

                  {/* Submission Time */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
                    <Clock className="size-3" />
                    <span>
                      {new Date(ideation.submitted_at || ideation.created_at).toLocaleString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for New Submission */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 rounded-full bg-gradient-to-r from-primary via-blue-600 to-cyan-500 hover:from-primary/90 hover:via-blue-600/90 hover:to-cyan-500/90 border-2 border-blue-100 hover:border-white hover:scale-110 h-14 w-14 p-0 z-50"
        onClick={() => setSubmissionDialogOpen(true)}
      >
        <Plus className="size-6" />
      </Button>

      {/* Ideation Detail Dialog - Controlled by URL query params */}
      <IdeationDetailDialog
        open={!!searchParams.ideation_id}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Clear ideation_id when closing
            navigate({
              to: '/participant/collaboration',
              search: {},
              resetScroll: false,
            })
          }
        }}
      />

      {/* Ideation Submission Dialog */}
      <IdeationOnlineSubmissionDialog
        open={submissionDialogOpen}
        onOpenChange={setSubmissionDialogOpen}
        onSubmit={async (data) => {
          await createIdeationMutation.mutateAsync(data)
        }}
        isSubmitting={createIdeationMutation.isPending}
      />
    </div>
  )
}

export default CollaborationOnlinePage
