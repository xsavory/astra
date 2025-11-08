/**
 * Staff Helpdesk - Participant Management
 *
 * Staff helpdesk page with full participant CRUD capabilities.
 * Same functionality as admin participant management, but without:
 * - Stats Dashboard
 * - View Submissions button
 * - Export CSV button
 *
 * Features included:
 * - Create/Read/Update/Delete participants
 * - Filter by type, check-in status, eligibility, company, search
 * - View participant details
 * - Toggle check-in status
 * - Delete validation (cannot delete checked-in participants)
 *
 * @see PRD.md Section 10.2 (Helpdesk Dashboard)
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState, useMemo } from 'react'
import { toast } from '@repo/react-components/ui'

import AdminParticipantFilters, {
  type ParticipantFilters,
} from 'src/components/admin-participant-filters'
import AdminParticipantTable from 'src/components/admin-participant-table'
import AdminParticipantFormDrawer from 'src/components/admin-participant-form-drawer'
import AdminParticipantDetailDrawer from 'src/components/admin-participant-detail-drawer'
import AdminDeleteConfirmationDialog from 'src/components/admin-delete-confirmation-dialog'
import AdminCheckinDialog from 'src/components/admin-checkin-dialog'
import PageLoader from 'src/components/page-loader'
import { Button } from '@repo/react-components/ui'
import api from 'src/lib/api'
import type { ParticipantType, User, CreateUserInput, UpdateUserInput } from 'src/types/schema'

export const Route = createFileRoute('/staff/helpdesk')({
  component: StaffHelpdeskPage,
  pendingComponent: PageLoader,
})

function StaffHelpdeskPage() {
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

  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  // State for check-in dialog
  const [isCheckinDialogOpen, setIsCheckinDialogOpen] = useState(false)
  const [checkinUser, setCheckinUser] = useState<User | null>(null)

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

  return (
    <div className="space-y-6 container px-4 py-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Helpdesk - Participant Management</h2>
          <p className="text-muted-foreground">
            Manage event participants and their check-in status
          </p>
        </div>
      </div>

      {/* Participant Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Participants</h3>
          <div className="flex gap-2">
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
    </div>
  )
}

export default StaffHelpdeskPage
