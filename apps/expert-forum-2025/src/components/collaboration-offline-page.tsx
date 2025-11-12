import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Users, Clock, ArrowLeft, Plus, CheckCircle2, RefreshCw } from 'lucide-react'

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
import GroupDetailDialog from './group-detail-dialog'
import GroupCreateDialog from './group-create-dialog'
import api from 'src/lib/api'
import type { User, Group } from 'src/types/schema'

interface CollaborationOfflinePageProps {
  user: User
}

// Skeleton Loading Component
function CollaborationOfflinePageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Group Grid Skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-40 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CollaborationOfflinePage({ user }: CollaborationOfflinePageProps) {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { group_id?: string }
  const queryClient = useQueryClient()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Fetch groups for current user
  const { data: groups = [], isLoading, refetch, isFetching } = useQuery<Group[]>({
    queryKey: ['groups', user.id],
    queryFn: () => api.groups.getParticipantGroups(user.id),
  })

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; member_ids: string[] }) => {
      // Create group with members in one API call
      const group = await api.groups.createGroup(user.id, {
        name: data.name,
        member_ids: data.member_ids,
      })

      return group
    },
    onSuccess: (group) => {
      // Invalidate queries to refresh groups data
      queryClient.invalidateQueries({ queryKey: ['groups', user.id] })

      // Show success toast
      toast.success('Group berhasil dibuat!')

      // Close create dialog
      setCreateDialogOpen(false)

      // Navigate to group detail page
      navigate({
        to: '/participant/collaboration',
        search: { group_id: group.id },
        resetScroll: false,
      })
    },
    onError: (error) => {
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat group'
      toast.warning(errorMessage)
    },
  })

  // Show skeleton while loading
  if (isLoading) {
    return <CollaborationOfflinePageSkeleton />
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Back & Refresh Buttons */}
      <div className="flex items-center justify-between mb-2 -mx-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate({ to: '/participant' })}
        >
          <ArrowLeft className="size-4 mr-2" />
          Kembali
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`size-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Collaboration</h1>
        <p className="text-muted-foreground mt-1">
          Buat group dan submit ideation bersama tim Anda
        </p>
      </div>

      {/* Empty State - No groups yet */}
      {groups.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="rounded-full bg-muted p-4">
                <Users className="size-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Belum ada group</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Anda belum membuat group apapun. Klik tombol "+" di bawah untuk membuat group baru.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Group List */}
      {groups.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total: {groups.length} group
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {groups.map((group) => (
              <Card
                key={group.id}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  group.is_submitted
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => {
                  navigate({
                    to: '/participant/collaboration',
                    search: { group_id: group.id },
                    resetScroll: false,
                  })
                }}
              >
                <CardHeader className="pb-3">
                  {/* Group Status Badge */}
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={group.is_submitted ? 'default' : 'outline'} className="text-xs">
                      {group.is_submitted ? (
                        <>
                          <CheckCircle2 className="size-3 mr-1" />
                          Sudah Submit
                        </>
                      ) : (
                        'Belum Submit'
                      )}
                    </Badge>
                  </div>

                  {/* Group Name */}
                  <CardTitle className="text-base sm:text-lg line-clamp-1">
                    {group.name}
                  </CardTitle>

                  {/* Group Info */}
                  <CardDescription className="text-xs sm:text-sm">
                    Group collaboration untuk ideation
                  </CardDescription>

                  {/* Submission Time (if submitted) */}
                  {group.is_submitted && group.submitted_at && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <Clock className="size-3" />
                      <span>
                        Submitted: {new Date(group.submitted_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for Creating New Group */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 rounded-xl bg-gradient-to-r from-primary via-blue-600 to-cyan-500 hover:from-primary/90 hover:via-blue-600/90 hover:to-cyan-500/90 border-2 border-blue-100 hover:border-white hover:scale-110 p-0 z-50"
        onClick={() => setCreateDialogOpen(true)}
      >
        <Plus className="size-6" />
        Create Group
      </Button>

      {/* Group Detail Dialog - Controlled by URL query params */}
      <GroupDetailDialog
        open={!!searchParams.group_id}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Clear group_id when closing
            navigate({
              to: '/participant/collaboration',
              search: {},
              resetScroll: false,
            })
          }
        }}
        currentUserId={user.id}
      />

      {/* Group Create Dialog */}
      <GroupCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={async (data) => {
          await createGroupMutation.mutateAsync(data)
        }}
        isSubmitting={createGroupMutation.isPending}
        currentUserId={user.id}
      />
    </div>
  )
}

export default CollaborationOfflinePage
