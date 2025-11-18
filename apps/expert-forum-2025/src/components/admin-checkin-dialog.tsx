/**
 * AdminCheckinDialog Component
 *
 * Dialog for admin to toggle participant check-in status
 * - Can check in or undo check-in
 * - Updates check-in timestamp and method
 * - Shows confirmation before action
 *
 * Note: This is an admin override feature, not part of original PRD
 * but useful for manual corrections and edge cases
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
} from '@repo/react-components/ui'
import { UserCheck, UserX } from 'lucide-react'
import type { User } from 'src/types/schema'

interface AdminCheckinDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  user: User | null
  isLoading?: boolean
}

function AdminCheckinDialog({
  open,
  onClose,
  onConfirm,
  user,
  isLoading = false,
}: AdminCheckinDialogProps) {
  if (!user) return null

  const isCheckedIn = user.is_checked_in

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isCheckedIn ? (
              <>
                <UserX className="h-5 w-5 text-destructive" />
                Undo Check-in
              </>
            ) : (
              <>
                <UserCheck className="h-5 w-5 text-primary" />
                Check-in Participant
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                {isCheckedIn
                  ? 'Are you sure you want to undo check-in for this participant?'
                  : 'Are you sure you want to check-in this participant manually?'}
              </p>

              {/* Participant Info */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Name</span>
                  <span className="text-sm">{user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="outline" className="capitalize">
                    {user.participant_type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status</span>
                  <Badge variant={isCheckedIn ? 'default' : 'secondary'}>
                    {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                  </Badge>
                </div>
                {isCheckedIn && user.event_checkin_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Check-in Time</span>
                    <span className="text-sm">
                      {new Date(user.event_checkin_time).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning message */}
              {isCheckedIn ? (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">
                    <strong>Warning:</strong> This will clear the check-in timestamp and method.
                    This action cannot be undone.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                  <p className="text-sm text-primary text-left">
                    <strong>Note:</strong> Check-in will be marked as "manual" and timestamped with
                    the current time.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={isCheckedIn ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isLoading ? (
              <>Processing...</>
            ) : isCheckedIn ? (
              <>Undo Check-in</>
            ) : (
              <>Confirm Check-in</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AdminCheckinDialog
