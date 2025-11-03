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
 * Phase 4: Detail View 🚧 TODO
 * - [ ] AdminParticipantDetailDrawer (basic info + timeline)
 *
 * Phase 5: Submission Management 🚧 TODO
 * - [ ] AdminSubmissionDrawer (list + detail + export)
 *
 * @see PRD.md Section 9 for full requirements
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserCheck, Trophy, FileText, RefreshCw, Plus, Download } from 'lucide-react'
import { useState, useMemo } from 'react'
import { toast } from '@repo/react-components/ui'

import AdminStatsCard from 'src/components/admin-stats-card'
import AdminParticipantFilters, {
  type ParticipantFilters,
} from 'src/components/admin-participant-filters'
import AdminParticipantTable from 'src/components/admin-participant-table'
import AdminParticipantFormDrawer from 'src/components/admin-participant-form-drawer'
import AdminDeleteConfirmationDialog from 'src/components/admin-delete-confirmation-dialog'
import PageLoader from 'src/components/page-loader'
import { Button } from '@repo/react-components/ui'
import api from 'src/lib/api'
import { exportParticipantsToCSV } from 'src/lib/csv-export'
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

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

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

  // Handle row click (edit for now, detail drawer in Phase 4)
  const handleRowClick = (user: User) => {
    handleEditParticipant(user)
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

  // Handle CSV export
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

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Monitor event statistics and manage participants
          </p>
        </div>
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
    </div>
  )
}

export default AdminIndexPage
