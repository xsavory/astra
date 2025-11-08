/**
 * AdminParticipantTable Component
 *
 * Data table for participant management with:
 * - Columns: Name, Email, Type, Company, Check-in Status, Eligibility, Actions
 * - Click row to open detail drawer
 * - Pagination with page size options (10, 25, 50, 100)
 * - Loading states with skeleton rows
 * - Empty state
 * - Responsive (horizontal scroll on mobile)
 *
 * @see PRD.md Section 9.2.2 (Participant Management)
 */

import { Trash2, CheckCircle2, XCircle, User } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/react-components/ui'
import type { User as UserType } from 'src/types/schema'

interface AdminParticipantTableProps {
  users: UserType[]
  isLoading?: boolean
  onRowClick?: (user: UserType) => void
  onDelete?: (userId: string) => void
  // Pagination props
  page: number
  limit: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

// Skeleton row component for loading state
function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-[150px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[200px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-[60px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[120px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-[80px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-[80px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
    </TableRow>
  )
}

// Empty state component
function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
          <User className="h-8 w-8" />
          <p className="text-sm">No participants found</p>
          <p className="text-xs">Try adjusting your filters</p>
        </div>
      </TableCell>
    </TableRow>
  )
}

function AdminParticipantTable({
  users,
  isLoading = false,
  onRowClick,
  onDelete,
  page,
  limit,
  totalPages,
  totalCount,
  onPageChange,
  onLimitChange,
}: AdminParticipantTableProps) {
  // Participant type badge variant
  const getTypeVariant = (type?: string) => {
    return type === 'online' ? 'default' : 'secondary'
  }

  return (
    <div className="space-y-4">
      {/* Table Container with horizontal scroll */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className='bg-muted'>
              <TableHead className='font-bold'>Name</TableHead>
              <TableHead className='font-bold'>Email</TableHead>
              <TableHead className='font-bold'>Type</TableHead>
              <TableHead className='font-bold'>Company</TableHead>
              <TableHead className='font-bold'>Check-in</TableHead>
              <TableHead className='font-bold'>Eligibility</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading State */}
            {isLoading &&
              Array.from({ length: limit }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}

            {/* Empty State */}
            {!isLoading && users.length === 0 && <EmptyState />}

            {/* Data Rows */}
            {!isLoading &&
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick?.(user)}
                >
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(user.participant_type)}>
                      {user.participant_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.company || '-'}</TableCell>
                  <TableCell>
                    {user.is_checked_in ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Checked In
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Not Checked In
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_eligible_to_draw ? (
                      <Badge variant="default" className="gap-1 bg-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Eligible
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        Not Eligible
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent row click
                        onDelete?.(user.id)
                      }}
                      disabled={user.is_checked_in}
                      title={
                        user.is_checked_in
                          ? 'Cannot delete checked-in participant'
                          : 'Delete participant'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && users.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Page size selector and count */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => onLimitChange(Number(value))}
              >
                <SelectTrigger className="w-[70px]">
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
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, totalCount)} of {totalCount} participants
            </div>
          </div>

          {/* Right: Page navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminParticipantTable
