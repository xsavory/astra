/**
 * AdminSubmissionDrawer Component
 *
 * Full-width drawer for viewing and managing submissions (ideations):
 * 1. Filters (Type, Company Case, Search)
 * 2. Paginated table showing all submissions
 * 3. Click row to view submission detail
 * 4. CSV export functionality
 *
 * Features:
 * - Read-only view (no edit/delete)
 * - Filters: Type (All/Group/Individual), Company Case, Search
 * - Pagination with size options (10, 25, 50, 100)
 * - Expandable detail view within drawer
 * - CSV export for all submissions
 *
 * @see PRD.md Section 9.2.5 (Submission Management)
 */

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Separator,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/react-components/ui'
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
  User as UserIcon,
  Search,
  Lightbulb,
  Trophy,
  Award,
  XCircle,
} from 'lucide-react'
import { toast } from '@repo/react-components/ui'
import api from 'src/lib/api'
import type { Ideation, User } from 'src/types/schema'
import AdminWinnersDialog from './admin-winners-dialog'
import AppButton from './app-button'

interface SubmissionFilters {
  type: 'all' | 'group' | 'individual'
  companyCase?: string
  search?: string
}

interface AdminSubmissionDrawerProps {
  open: boolean
  onClose: () => void
  onExportCSV?: () => void
}

type IdeationWithCreator = Ideation & { creator: User }

function AdminSubmissionDrawer({
  open,
  onClose,
  onExportCSV,
}: AdminSubmissionDrawerProps) {
  // State for pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // State for filters
  const [filters, setFilters] = useState<SubmissionFilters>({
    type: 'all',
    companyCase: undefined,
    search: undefined,
  })

  // State for search input (separate from filters for debounce)
  const [searchInput, setSearchInput] = useState<string>('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined }))
      setPage(1) // Reset to first page on search
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchInput])

  // State for selected submission (detail view)
  const [selectedSubmission, setSelectedSubmission] = useState<IdeationWithCreator | null>(null)
  const [submissionDetails, setSubmissionDetails] = useState<{
    ideation: Ideation
    creator: User
    participants?: User[]
  } | null>(null)

  // State for winners dialog
  const [winnersDialogOpen, setWinnersDialogOpen] = useState(false)

  // State for winner confirmation dialog
  const [confirmWinnerDialog, setConfirmWinnerDialog] = useState<{
    open: boolean
    action: 'select' | 'unselect'
    ideationId: string
  }>({
    open: false,
    action: 'select',
    ideationId: '',
  })

  // Query client for invalidation
  const queryClient = useQueryClient()

  // Build API filters
  const apiFilters = useMemo(
    () => ({
      is_group:
        filters.type === 'all'
          ? undefined
          : filters.type === 'group'
            ? true
            : false,
      company_case: filters.companyCase,
      search: filters.search,
    }),
    [filters]
  )

  // Fetch submissions with filters
  const {
    data: submissionsData,
    isLoading: isSubmissionsLoading,
  } = useQuery({
    queryKey: ['adminSubmissions', page, limit, apiFilters],
    queryFn: () =>
      api.ideations.getIdeationsWithFilters({
        page,
        limit,
        filters: apiFilters,
      }),
    enabled: open, // Only fetch when drawer is open
  })

  // Fetch submission details when selected
  const { data: detailsData, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['submissionDetails', selectedSubmission?.id],
    queryFn: () => api.ideations.getIdeationWithDetails(selectedSubmission!.id),
    enabled: !!selectedSubmission,
  })

  // Update details state when data changes
  useMemo(() => {
    if (detailsData) {
      setSubmissionDetails(detailsData)
    }
  }, [detailsData])

  // Mutation for selecting winner
  const selectWinnerMutation = useMutation({
    mutationFn: (ideationId: string) => api.ideations.selectAsWinner(ideationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] })
      queryClient.invalidateQueries({ queryKey: ['submissionDetails'] })
      queryClient.invalidateQueries({ queryKey: ['winners'] })
      toast.success('Submission selected as winner')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to select submission as winner')
    },
  })

  // Mutation for unselecting winner
  const unselectWinnerMutation = useMutation({
    mutationFn: (ideationId: string) => api.ideations.unselectAsWinner(ideationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] })
      queryClient.invalidateQueries({ queryKey: ['submissionDetails'] })
      queryClient.invalidateQueries({ queryKey: ['winners'] })
      toast.success('Submission removed from winners')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove submission from winners')
    },
  })

  // Get unique company cases for filter dropdown
  const companyCases = useMemo(() => {
    const cases = new Set<string>()
    submissionsData?.items.forEach((submission) => {
      if (submission.company_case) {
        cases.add(submission.company_case)
      }
    })
    return Array.from(cases).sort()
  }, [submissionsData])

  // Handle filter changes
  const handleFilterChange = (key: keyof SubmissionFilters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page on filter change
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number(newLimit))
    setPage(1)
  }

  // Handle row click
  const handleRowClick = (submission: IdeationWithCreator) => {
    setSelectedSubmission(submission)
  }

  // Handle back to list
  const handleBackToList = () => {
    setSelectedSubmission(null)
    setSubmissionDetails(null)
  }

  // Handle select/unselect winner button click
  const handleWinnerAction = (action: 'select' | 'unselect', ideationId: string) => {
    setConfirmWinnerDialog({
      open: true,
      action,
      ideationId,
    })
  }

  // Handle confirm winner action
  const handleConfirmWinnerAction = () => {
    if (confirmWinnerDialog.action === 'select') {
      selectWinnerMutation.mutate(confirmWinnerDialog.ideationId)
    } else {
      unselectWinnerMutation.mutate(confirmWinnerDialog.ideationId)
    }
    setConfirmWinnerDialog({ open: false, action: 'select', ideationId: '' })
  }

  // Handle cancel confirmation
  const handleCancelConfirmation = () => {
    setConfirmWinnerDialog({ open: false, action: 'select', ideationId: '' })
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
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto flex flex-col p-0">
        {!selectedSubmission ? (
          <>
            {/* List View */}
            <SheetHeader className="px-6 pt-6">
              <SheetTitle>Submission Management</SheetTitle>
              <SheetDescription>
                View all participant submissions (ideations)
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 px-6 pb-4 space-y-4">
              {/* Filters */}
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  {/* Type Filter */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => handleFilterChange('type', value)}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Company Case Filter */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Company Case</label>
                    <Select
                      value={filters.companyCase || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange('companyCase', value === 'all' ? undefined : value)
                      }
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder="All Cases" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cases</SelectItem>
                        {companyCases.map((companyCase) => (
                          <SelectItem key={companyCase} value={companyCase}>
                            {companyCase}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search title or description..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Export Button & View Winners */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {submissionsData?.total || 0} submission(s) found
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWinnersDialogOpen(true)}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    View Winners
                  </Button>
                  <Button variant="outline" size="sm" onClick={onExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted'>
                      <TableHead className='font-bold'>Title</TableHead>
                      <TableHead className='font-bold'>Company Case</TableHead>
                      <TableHead className='font-bold'>Creator</TableHead>
                      <TableHead className='font-bold'>Type</TableHead>
                      <TableHead className='font-bold'>Winner</TableHead>
                      <TableHead className='font-bold'>Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isSubmissionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Loading submissions...
                        </TableCell>
                      </TableRow>
                    ) : submissionsData?.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No submissions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      submissionsData?.items.map((submission) => (
                        <TableRow
                          key={submission.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(submission)}
                        >
                          <TableCell className="font-medium">{submission.title}</TableCell>
                          <TableCell>{submission.company_case}</TableCell>
                          <TableCell>{submission.creator.name}</TableCell>
                          <TableCell>
                            <Badge variant={submission.is_group ? 'default' : 'secondary'}>
                              {submission.is_group ? (
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
                          </TableCell>
                          <TableCell>
                            {submission.is_winner ? (
                              <Badge variant="default">
                                <Trophy className="h-3 w-3 mr-1" />
                                Winner
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {submission.submitted_at ? formatDateTime(submission.submitted_at) : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {submissionsData && submissionsData.total > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select value={limit.toString()} onValueChange={handleLimitChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {submissionsData.total_pages}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === submissionsData.total_pages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Detail View */}
            <div className="flex flex-col h-full">
              {/* Header with Back Button */}
              <div className="px-6 pt-6 pb-3 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  
                  <Button variant="outline" size="sm" onClick={handleBackToList} className="h-8">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  
                </div>
                <div>
                  <div className='flex items-end justify-between'>
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold leading-tight">{selectedSubmission.title}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Submission by <span className="font-semibold">{selectedSubmission.creator.name}</span> from <span>{selectedSubmission.creator.company}</span>
                        </p>
                      </div>
                    </div>
                    {submissionDetails?.ideation.is_winner ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleWinnerAction('unselect', submissionDetails.ideation.id)
                        }
                        disabled={
                          selectWinnerMutation.isPending || unselectWinnerMutation.isPending
                        }
                        className="h-8"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Remove from Winners
                      </Button>
                    ) : (
                      <AppButton
                        size="sm"
                        onClick={() =>
                          handleWinnerAction('select', submissionDetails?.ideation.id as string)
                        }
                        disabled={
                          selectWinnerMutation.isPending || unselectWinnerMutation.isPending
                        }
                        className="h-8"
                      >
                        <Award className="h-3.5 w-3.5 mr-1.5" />
                        Select as Winner
                      </AppButton>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {isDetailsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading details...</p>
                ) : submissionDetails ? (
                  <div className="space-y-4">
                    {/* Metadata Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border bg-card/50">
                        <p className="text-xs text-muted-foreground mb-1">Winner Status</p>
                        {submissionDetails.ideation.is_winner ? (
                          <Badge variant="default" className="h-6">
                            <Trophy className="h-3 w-3 mr-1" />
                            Winner
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not selected</span>
                        )}
                      </div>
                      <div className="p-3 rounded-lg border bg-card/50">
                        <p className="text-xs text-muted-foreground mb-1">Type</p>
                        <Badge variant={submissionDetails.ideation.is_group ? 'default' : 'secondary'} className="h-6">
                          {submissionDetails.ideation.is_group ? (
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
                      <div className="p-3 rounded-lg border bg-card/50">
                        <p className="text-xs text-muted-foreground mb-1">Company Case</p>
                        <p className="text-sm font-medium">{submissionDetails.ideation.company_case}</p>
                      </div>
                      <div className="p-3 rounded-lg border bg-card/50">
                        <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                        <p className="text-sm font-medium">
                          {submissionDetails.ideation.submitted_at ? formatDateTime(submissionDetails.ideation.submitted_at) : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-4 rounded-lg border bg-card/50">
                      <h3 className="text-sm font-semibold mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {submissionDetails.ideation.description}
                      </p>
                    </div>

                    {/* Creator */}
                    <div className="p-4 rounded-lg border bg-card/50">
                      <h3 className="text-sm font-semibold mb-2">Creator</h3>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{submissionDetails.creator.name}</p>
                          <p className="text-xs text-muted-foreground">{submissionDetails.creator.email}</p>
                          {submissionDetails.creator.company && (
                            <p className="text-xs text-muted-foreground">{submissionDetails.creator.company}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Group Members (if group submission) */}
                    {submissionDetails.ideation.is_group && submissionDetails.participants && (
                      <div className="p-4 rounded-lg border bg-card/50">
                        <h3 className="text-sm font-semibold mb-3">
                          Group Members ({submissionDetails.participants.length})
                        </h3>
                        <div className="space-y-2">
                          {submissionDetails.participants.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center gap-3 p-3 rounded-md border bg-background/50"
                            >
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <UserIcon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{participant.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{participant.email}</p>
                                {participant.company && (
                                  <p className="text-xs text-muted-foreground truncate">{participant.company}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </SheetContent>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmWinnerDialog.open}
        onOpenChange={(open) => {
          if (!open) handleCancelConfirmation()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-left'>
              {confirmWinnerDialog.action === 'select'
                ? 'Select as Winner?'
                : 'Remove from Winners?'}
            </AlertDialogTitle>
            <AlertDialogDescription className='text-left'>
              {confirmWinnerDialog.action === 'select'
                ? 'This submission will be marked as a winner.'
                : 'This submission will be removed from the winners list.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirmation}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWinnerAction}>
              {confirmWinnerDialog.action === 'select' ? 'Confirm' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Winners Dialog */}
      <AdminWinnersDialog
        open={winnersDialogOpen}
        onClose={() => setWinnersDialogOpen(false)}
      />
    </Sheet>
  )
}

export default AdminSubmissionDrawer
