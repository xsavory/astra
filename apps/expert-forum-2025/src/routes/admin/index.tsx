/**
 * Admin Dashboard - Main Page
 *
 * Implementation Status:
 * =====================
 * Phase 1: Core Foundation ✅ DONE
 * - AdminPageLayout: ✅ Complete (navbar with user info, logout, fullscreen)
 * - AdminStatsCard: ✅ Complete (reusable stats component)
 * - Stats Section: ✅ Complete (4 metrics with real-time updates)
 *
 * Phase 2: Data Display ✅ DONE
 * - ✅ AdminParticipantFilters (type, status, company, search)
 * - ✅ AdminParticipantTable (read-only with pagination)
 * - [ ] Click row to open detail drawer (Phase 4)
 *
 * Phase 3: CRUD Operations ✅ DONE
 * - ✅ AdminParticipantFormDrawer (add/edit)
 * - ✅ Delete with validation
 * - ✅ CSV export functionality
 *
 * Phase 4: Detail View ✅ DONE
 * - ✅ AdminParticipantDetailDrawer (basic info + timeline)
 * - ✅ Click row to open detail drawer
 * - ✅ Edit/Delete actions from detail drawer
 *
 * Phase 5: Submission Management ✅ DONE
 * - ✅ AdminSubmissionDrawer (list + detail + export)
 *
 * @see PRD.md Section 9 for full requirements
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserCheck, Trophy, FileText, RefreshCw, Plus, Download, Award } from 'lucide-react'
import { useState, useMemo } from 'react'
import { toast, Switch, Label, Button } from '@repo/react-components/ui'

import AdminStatsCard from 'src/components/admin-stats-card'
import AdminParticipantFilters, {
  type ParticipantFilters,
} from 'src/components/admin-participant-filters'
import AdminParticipantTable from 'src/components/admin-participant-table'
import AdminParticipantFormDrawer from 'src/components/admin-participant-form-drawer'
import AdminParticipantDetailDrawer from 'src/components/admin-participant-detail-drawer'
import AdminSubmissionDrawer from 'src/components/admin-submission-drawer'
import AdminDeleteConfirmationDialog from 'src/components/admin-delete-confirmation-dialog'
import AdminCheckinDialog from 'src/components/admin-checkin-dialog'
import AdminDrawHistoryDialog from 'src/components/admin-draw-history-dialog'
import AdminBoothVotesResultDialog from 'src/components/admin-booth-votes-result-dialog'
import PageLoader from 'src/components/page-loader'
import api from 'src/lib/api'
import { exportParticipantsToCSV, exportSubmissionsToCSV } from 'src/lib/csv-export'
import type { Stats, ParticipantType, User, CreateUserInput, UpdateUserInput } from 'src/types/schema'

export const Route = createFileRoute('/admin/')({
  component: AdminIndexPage,
  pendingComponent: PageLoader,
})

function AdminIndexPage() {
  const queryClient = useQueryClient()

  // State for pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // State for filters
  const [filters, setFilters] = useState<ParticipantFilters>({
    participantType: 'all',
    isCheckedIn: 'all',
    isEligibleToDraw: 'all',
    company: undefined,
    search: undefined,
  })

  // State for form drawer
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // State for detail drawer
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [detailUser, setDetailUser] = useState<User | null>(null)

  // State for submission drawer
  const [isSubmissionDrawerOpen, setIsSubmissionDrawerOpen] = useState(false)

  // State for draw history dialog
  const [isDrawHistoryDialogOpen, setIsDrawHistoryDialogOpen] = useState(false)

  // State for booth votes result dialog
  const [isBoothVotesResultDialogOpen, setIsBoothVotesResultDialogOpen] = useState(false)

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  // State for check-in dialog
  const [isCheckinDialogOpen, setIsCheckinDialogOpen] = useState(false)
  const [checkinUser, setCheckinUser] = useState<User | null>(null)

  // Fetch current event
  const { data: event } = useQuery({
    queryKey: ['current-event'],
    queryFn: () => api.events.getEvent(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  })

  // Fetch stats with real-time updates
  const { data: stats, isLoading: isStatsLoading, refetch, isFetching } = useQuery<Stats>({
    queryKey: ['adminStats'],
    queryFn: () => api.stats.getStats(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  })

  // Build API filters from state
  const apiFilters = useMemo(
    () => ({
      participant_type:
        filters.participantType !== 'all'
          ? (filters.participantType as ParticipantType)
          : undefined,
      is_checked_in:
        filters.isCheckedIn !== 'all' ? (filters.isCheckedIn as boolean) : undefined,
      is_eligible_to_draw:
        filters.isEligibleToDraw !== 'all'
          ? (filters.isEligibleToDraw as boolean)
          : undefined,
      company: filters.company,
      search: filters.search,
    }),
    [filters]
  )

  // Fetch participants with filters
  const {
    data: participantsData,
    isLoading: isParticipantsLoading,
    refetch: refetchParticipants,
  } = useQuery({
    queryKey: ['adminParticipants', page, limit, apiFilters],
    queryFn: () =>
      api.users.getUsers({
        page,
        limit,
        filters: apiFilters,
      }),
  })

  // Get unique companies for filter dropdown (from current data)
  const companies = useMemo(() => {
    const uniqueCompanies = new Set<string>()
    participantsData?.items.forEach((user) => {
      if (user.company) {
        uniqueCompanies.add(user.company)
      }
    })
    return Array.from(uniqueCompanies).sort()
  }, [participantsData])

  // Handle filter changes
  const handleFiltersChange = (newFilters: ParticipantFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page on filter change
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page on limit change
  }

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => api.users.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminParticipants'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      toast.success('Participant created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create participant')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserInput }) =>
      api.users.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminParticipants'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      toast.success('Participant updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update participant')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => api.users.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminParticipants'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      toast.success('Participant deleted successfully')
      setIsDeleteDialogOpen(false)
      setDeletingUser(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete participant')
    },
  })

  const checkinMutation = useMutation({
    mutationFn: ({ userId, isCheckedIn }: { userId: string; isCheckedIn: boolean }) =>
      api.users.updateCheckinStatus(userId, isCheckedIn, 'manual'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminParticipants'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      toast.success('Check-in status updated successfully')
      setIsCheckinDialogOpen(false)
      setCheckinUser(null)
      // Also update detail drawer if open
      if (detailUser && checkinUser && detailUser.id === checkinUser.id) {
        // Refetch to update detail drawer
        refetchParticipants()
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update check-in status')
    },
  })

  // Mutation to toggle event active status
  const toggleEventActiveMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      if (!event?.id) throw new Error('No active event')
      await api.events.updateEventActive(event.id, isActive)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-event'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      toast.success('Event status updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update event status')
    },
  })

  // Handle add participant
  const handleAddParticipant = () => {
    setEditingUser(null)
    setIsFormDrawerOpen(true)
  }

  // Handle edit participant
  const handleEditParticipant = (user: User) => {
    setEditingUser(user)
    setIsFormDrawerOpen(true)
  }

  // Handle form submit (create or update)
  const handleFormSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    if (editingUser) {
      // Update existing user
      await updateMutation.mutateAsync({
        userId: editingUser.id,
        data: data as UpdateUserInput,
      })
    } else {
      // Create new user
      await createMutation.mutateAsync(data as CreateUserInput)
    }
  }

  // Handle row click (opens detail drawer)
  const handleRowClick = (user: User) => {
    setDetailUser(user)
    setIsDetailDrawerOpen(true)
  }

  // Handle detail drawer actions
  const handleDetailEdit = (user: User) => {
    setIsDetailDrawerOpen(false)
    handleEditParticipant(user)
  }

  const handleDetailDelete = () => {
    const user = detailUser
    if (user) {
      setIsDetailDrawerOpen(false)
      setDeletingUser(user)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleDetailToggleCheckin = (user: User) => {
    setIsDetailDrawerOpen(false)
    setCheckinUser(user)
    setIsCheckinDialogOpen(true)
  }

  // Handle delete click
  const handleDelete = (userId: string) => {
    const user = participantsData?.items.find((u) => u.id === userId)
    if (user) {
      setDeletingUser(user)
      setIsDeleteDialogOpen(true)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (deletingUser) {
      await deleteMutation.mutateAsync(deletingUser.id)
    }
  }

  // Handle check-in confirm
  const handleCheckinConfirm = async () => {
    if (checkinUser) {
      await checkinMutation.mutateAsync({
        userId: checkinUser.id,
        isCheckedIn: !checkinUser.is_checked_in,
      })
    }
  }

  // Handle CSV export (participants)
  const handleExportCSV = async () => {
    try {
      toast.info('Fetching participant data...')
      const allUsers = await api.users.getAllUsersForExport()
      exportParticipantsToCSV(allUsers)
      toast.success('CSV exported successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to export CSV')
    }
  }

  // Handle CSV export (submissions)
  const handleExportSubmissionsCSV = async () => {
    try {
      toast.info('Fetching submission data...')
      const allSubmissions = await api.ideations.getAllIdeationsForExport()

      // Fetch group members for group submissions
      const groupMembers = new Map<string, User[]>()
      for (const submission of allSubmissions) {
        if (submission.is_group && submission.group_id) {
          const details = await api.ideations.getIdeationWithDetails(submission.id)
          if (details.participants) {
            groupMembers.set(submission.group_id, details.participants)
          }
        }
      }

      exportSubmissionsToCSV(allSubmissions, groupMembers)
      toast.success('Submissions CSV exported successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to export submissions CSV')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button and event toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Monitor event statistics and manage participants
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Event Active Toggle */}
          {event && (
            <div className="flex items-center gap-3 px-4 py-2 border rounded-md bg-card cursor-pointer">
              <Label
                htmlFor="event-active-toggle"
                className="text-sm font-medium cursor-pointer"
              >
                Event Active
              </Label>
              <Switch
                id="event-active-toggle"
                checked={event.is_active}
                onCheckedChange={(checked) => toggleEventActiveMutation.mutate(checked)}
                disabled={toggleEventActiveMutation.isPending}
                className='cursor-pointer'
              />
            </div>
          )}

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch()
              refetchParticipants()
            }}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Participants */}
        <AdminStatsCard
          title="Total Participants"
          value={stats?.totalParticipants.total || 0}
          badges={[
            { label: 'Offline', value: stats?.totalParticipants.offline || 0 },
            { label: 'Online', value: stats?.totalParticipants.online || 0 },
          ]}
          icon={Users}
          isLoading={isStatsLoading}
        />

        {/* Checked In */}
        <AdminStatsCard
          title="Checked In"
          value={stats?.checkedIn.total || 0}
          badges={[
            { label: 'Offline', value: stats?.checkedIn.offline || 0 },
            { label: 'Online', value: stats?.checkedIn.online || 0 },
          ]}
          icon={UserCheck}
          isLoading={isStatsLoading}
        />

        {/* Eligible for Draw */}
        <AdminStatsCard
          title="Eligible for Draw"
          value={stats?.eligibleForDraw || 0}
          icon={Trophy}
          isLoading={isStatsLoading}
        />

        {/* Submissions */}
        <AdminStatsCard
          title="Submissions"
          value={stats?.submissions.total || 0}
          badges={[
            { label: 'Group', value: stats?.submissions.group || 0 },
            { label: 'Individual', value: stats?.submissions.individual || 0 },
          ]}
          icon={FileText}
          isLoading={isStatsLoading}
        />
      </div>

      <div className='flex gap-3 flex-wrap'>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsBoothVotesResultDialogOpen(true)}>
          <Award className="h-4 w-4 mr-2" />
          Booth Votes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSubmissionDrawerOpen(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Ideations
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDrawHistoryDialogOpen(true)}>
          <Trophy className="h-4 w-4 mr-2" />
          Draw History
        </Button>
      </div>

      {/* Participant Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Participant Management</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={handleAddParticipant}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Participant
            </Button>
          </div>
        </div>

        {/* Filters */}
        <AdminParticipantFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          companies={companies}
        />

        {/* Table */}
        <AdminParticipantTable
          users={participantsData?.items || []}
          isLoading={isParticipantsLoading}
          onRowClick={handleRowClick}
          onDelete={handleDelete}
          page={page}
          limit={limit}
          totalPages={participantsData?.total_pages || 0}
          totalCount={participantsData?.total || 0}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Detail Drawer */}
      <AdminParticipantDetailDrawer
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        user={detailUser}
        onEdit={handleDetailEdit}
        onDelete={handleDetailDelete}
        onToggleCheckin={handleDetailToggleCheckin}
      />

      {/* Form Drawer for Add/Edit */}
      <AdminParticipantFormDrawer
        open={isFormDrawerOpen}
        onClose={() => setIsFormDrawerOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AdminDeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        user={deletingUser}
        isDeleting={deleteMutation.isPending}
      />

      {/* Check-in Dialog */}
      <AdminCheckinDialog
        open={isCheckinDialogOpen}
        onClose={() => setIsCheckinDialogOpen(false)}
        onConfirm={handleCheckinConfirm}
        user={checkinUser}
        isLoading={checkinMutation.isPending}
      />

      {/* Submission Drawer */}
      <AdminSubmissionDrawer
        open={isSubmissionDrawerOpen}
        onClose={() => setIsSubmissionDrawerOpen(false)}
        onExportCSV={handleExportSubmissionsCSV}
      />

      {/* Draw History Dialog */}
      <AdminDrawHistoryDialog
        open={isDrawHistoryDialogOpen}
        onClose={() => setIsDrawHistoryDialogOpen(false)}
      />

      {/* Booth Votes Result Dialog */}
      <AdminBoothVotesResultDialog
        open={isBoothVotesResultDialogOpen}
        onClose={() => setIsBoothVotesResultDialogOpen(false)}
      />
    </div>
  )
}

export default AdminIndexPage
