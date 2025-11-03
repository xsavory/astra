/**
 * AdminDeleteConfirmationDialog Component
 *
 * Confirmation dialog for deleting participants:
 * - Shows participant info to confirm deletion
 * - Validates that participant is not checked in
 * - Displays error if participant cannot be deleted
 * - Handles delete action with loading state
 *
 * @see PRD.md Section 9.2.2 (Participant Management - Delete with validation)
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
} from '@repo/react-components/ui'
import type { User } from 'src/types/schema'

interface AdminDeleteConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  user: User | null
  isDeleting?: boolean
}

function AdminDeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  user,
  isDeleting = false,
}: AdminDeleteConfirmationDialogProps) {
  if (!user) return null

  const canDelete = !user.is_checked_in

  const handleConfirm = async () => {
    if (!canDelete) return
    // Don't close dialog here - let parent handle it after mutation completes
    await onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Participant</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {canDelete ? (
                <>
                  <p>
                    Are you sure you want to delete this participant? This action
                    cannot be undone.
                  </p>
                  <div className="rounded-md bg-muted p-4 space-y-2">
                    <div>
                      <span className="text-sm font-medium">Name:</span>{' '}
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Email:</span>{' '}
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Type:</span>{' '}
                      <span className="text-sm capitalize">
                        {user.participant_type}
                      </span>
                    </div>
                    {user.company && (
                      <div>
                        <span className="text-sm font-medium">Company:</span>{' '}
                        <span className="text-sm">{user.company}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-destructive font-medium">
                    Cannot delete this participant
                  </p>
                  <div className="rounded-md bg-destructive/10 p-4 space-y-2">
                    <p className="text-sm">
                      This participant has already checked in to the event and
                      cannot be deleted.
                    </p>
                    <div className="mt-2">
                      <span className="text-sm font-medium">Name:</span>{' '}
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Email:</span>{' '}
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AdminDeleteConfirmationDialog
