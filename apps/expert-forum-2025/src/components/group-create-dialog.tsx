import { useState, useEffect, useCallback } from 'react'
import { Users, Plus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  Button,
  Label,
  Input,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import ParticipantSearchSelector from './collaboration-participant-search'

interface GroupCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; member_ids: string[] }) => Promise<void>
  isSubmitting: boolean
  currentUserId: string
}

const MINIMUM_GROUP_NAME_LENGTH = 3

function GroupCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  currentUserId,
}: GroupCreateDialogProps) {
  const isMobile = useIsMobile()
  const [groupName, setGroupName] = useState('')
  const [selectedParticipantId, setSelectedParticipantId] = useState('')

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setGroupName('')
      setSelectedParticipantId('')
    }
  }, [open])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    await onSubmit({
      name: groupName.trim(),
      member_ids: selectedParticipantId ? [selectedParticipantId] : [],
    })
  }, [groupName, selectedParticipantId, onSubmit])

  // Check if form is valid
  const isFormValid =
    groupName.trim().length >= MINIMUM_GROUP_NAME_LENGTH &&
    selectedParticipantId.length > 0

  const formContent = (
    <div className="space-y-4">
      {/* Group Name Input */}
      <div className="space-y-2">
        <Label htmlFor="group-name">Nama Group *</Label>
        <Input
          id="group-name"
          placeholder="Masukkan nama group..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={100}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Minimal {MINIMUM_GROUP_NAME_LENGTH} karakter ({groupName.trim().length}/{MINIMUM_GROUP_NAME_LENGTH})
        </p>
      </div>

      {/* Participant Selection */}
      <ParticipantSearchSelector
        selectedParticipantId={selectedParticipantId}
        onSelectParticipant={setSelectedParticipantId}
        excludeUserIds={[currentUserId]}
      />

      <div className="bg-muted/50 p-3 rounded-md">
        <p className="text-xs text-muted-foreground">
          Group akan dibuat dengan 2 anggota (Anda + participant yang dipilih). Anda dapat mengelola anggota setelah group dibuat.
        </p>
      </div>
    </div>
  )

  // Render Drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Buat Group Baru
            </DrawerTitle>
            <DrawerDescription>
              Buat group untuk kolaborasi ideation
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[60vh]">
            {formContent}
          </div>
          <DrawerFooter className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Membuat...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Group
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" disabled={isSubmitting}>
                Batal
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  // Render Dialog for desktop
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Buat Group Baru
          </DialogTitle>
          <DialogDescription>
            Buat group untuk kolaborasi ideation
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {formContent}
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Membuat...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Buat Group
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GroupCreateDialog
