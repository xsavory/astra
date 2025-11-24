/**
 * AdminParticipantDetailDrawer Component
 *
 * Full-width drawer displaying participant details:
 * 1. Basic Information with status badges
 * 2. Check-in information (timestamp and method)
 *
 * Features:
 * - Read-only detail view
 * - Edit/Delete actions in footer
 * - Clean layout with proper spacing
 *
 * @see PRD.md Section 9.2.3 (Participant Detail View)
 */

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  Button,
  Badge,
  Separator,
} from '@repo/react-components/ui'
import {
  Pencil,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import type { User } from 'src/types/schema'

interface AdminParticipantDetailDrawerProps {
  open: boolean
  onClose: () => void
  user: User | null
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void
  onToggleCheckin?: (user: User) => void
}

function AdminParticipantDetailDrawer({
  open,
  onClose,
  user,
  onEdit,
  onDelete,
  onToggleCheckin,
}: AdminParticipantDetailDrawerProps) {
  if (!user) return null

  const handleEdit = () => {
    if (onEdit) {
      onEdit(user)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(user.id)
    }
  }

  const handleToggleCheckin = () => {
    if (onToggleCheckin) {
      onToggleCheckin(user)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'short',
    }).format(date)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle>{user.name}</SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 p-6">
          {/* Basic Information Section */}
          <div className="space-y-3">
            <div className="grid gap-3">
              {/* Participant Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Participant Type</span>
                <Badge variant="outline" className="capitalize">
                  {user.participant_type}
                </Badge>
              </div>

              {/* Company */}
              {user.company && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Company</span>
                  <span className="text-sm font-medium">{user.company}</span>
                </div>
              )}

              {/* Division */}
              {user.division && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Division</span>
                  <span className="text-sm font-medium">{user.division}</span>
                </div>
              )}

              {/* Registered At */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Registered</span>
                <span className="text-sm font-medium">{formatDateTime(user.created_at)}</span>
              </div>

              {/* Last Sign In */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sign In</span>
                <span className="text-sm font-medium">
                  {user.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : 'Never'}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Status</h3>
            <div className="grid gap-3">
              {/* Check-in Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Check-in Status</span>
                <Badge variant={user.is_checked_in ? 'default' : 'secondary'}>
                  {user.is_checked_in ? 'Checked In' : 'Not Checked In'}
                </Badge>
              </div>

              {/* Eligibility Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Draw Eligibility</span>
                <Badge variant={user.is_eligible_to_draw ? 'default' : 'secondary'}>
                  {user.is_eligible_to_draw ? 'Eligible' : 'Not Eligible'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Check-in Information */}
          {user.is_checked_in && user.event_checkin_time && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Check-in Information</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Check-in Time</span>
                    <span className="text-sm font-medium">{formatTime(user.event_checkin_time)}</span>
                  </div>
                  {user.event_checkin_method && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Check-in Method</span>
                      <Badge variant="outline" className="capitalize">
                        {user.event_checkin_method}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <SheetFooter>
          <div className="flex flex-col gap-2 w-full">
            {/* Check-in Toggle Button */}
            <Button
              variant={user.is_checked_in ? 'outline' : 'default'}
              className="w-full"
              onClick={handleToggleCheckin}
            >
              {user.is_checked_in ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Undo Check-in
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check-in Participant
                </>
              )}
            </Button>

            {/* Edit and Delete Buttons */}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleEdit}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDelete}
                disabled={user.is_checked_in}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default AdminParticipantDetailDrawer
