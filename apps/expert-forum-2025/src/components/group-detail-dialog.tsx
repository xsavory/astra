import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Users, X, Loader2, CheckCircle2 } from 'lucide-react'

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
  toast,
  Badge,
  Separator,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import GroupDetailMembers from './group-detail-members'
import GroupDetailInvite from './group-detail-invite'
import GroupDetailIdeationForm from './group-detail-ideation-form'
import GroupDetailIdeationView from './group-detail-ideation-view'
import api from 'src/lib/api'
import { MIN_GROUP_SIZE } from 'src/lib/constants'
import type { GroupWithDetails } from 'src/types/schema'

interface GroupDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
}

const MINIMUM_TITLE_LENGTH = 10
const MINIMUM_DESCRIPTION_LENGTH = 50

function GroupDetailDialog({
  open,
  onOpenChange,
  currentUserId,
}: GroupDetailDialogProps) {
  const isMobile = useIsMobile()
  const searchParams = useSearch({ strict: false }) as { group_id?: string }
  const queryClient = useQueryClient()

  // Local state
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [companyCase, setCompanyCase] = useState('')

  // Fetch group details
  const { data: group, isLoading: isLoadingGroup } = useQuery<GroupWithDetails>({
    queryKey: ['group', searchParams.group_id],
    queryFn: () => api.groups.getGroupWithDetails(searchParams.group_id!),
    enabled: !!searchParams.group_id && open,
  })

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: async (participantId: string) => {
      if (!searchParams.group_id) throw new Error('Group ID not found')
      return api.groups.inviteToGroup(searchParams.group_id, participantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', searchParams.group_id] })
      queryClient.invalidateQueries({ queryKey: ['groups', currentUserId] })
      toast.success('Anggota berhasil ditambahkan ke group!')
      setSelectedParticipantId('')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan anggota'
      toast.warning(errorMessage)
    },
  })

  // Leave group mutation
  const leaveMutation = useMutation({
    mutationFn: async (participantId: string) => {
      if (!searchParams.group_id) throw new Error('Group ID not found')
      return api.groups.leaveGroup(searchParams.group_id, participantId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', searchParams.group_id] })
      queryClient.invalidateQueries({ queryKey: ['groups', currentUserId] })
      toast.success('Berhasil keluar dari group')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Gagal keluar dari group'
      toast.warning(errorMessage)
    },
  })

  // Submit ideation mutation
  const submitIdeationMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; company_case: string }) => {
      if (!searchParams.group_id) throw new Error('Group ID not found')
      return api.ideations.createGroupIdeation(searchParams.group_id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', searchParams.group_id] })
      queryClient.invalidateQueries({ queryKey: ['groups', currentUserId] })
      toast.success('Ideation berhasil disubmit!')

      // Reset form
      setTitle('')
      setDescription('')
      setCompanyCase('')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Gagal submit ideation'
      toast.warning(errorMessage)
    },
  })

  // Reset form when dialog closes or group changes
  useEffect(() => {
    if (!open) {
      setSelectedParticipantId('')
      setTitle('')
      setDescription('')
      setCompanyCase('')
    }
  }, [open, searchParams.group_id])

  // Check if group can submit (exactly 2 members)
  const memberCount = group?.participants?.length || 0
  const canSubmit = memberCount === MIN_GROUP_SIZE && !group?.is_submitted

  // Check if form is valid
  const isFormValid =
    title.trim().length >= MINIMUM_TITLE_LENGTH &&
    description.trim().length >= MINIMUM_DESCRIPTION_LENGTH &&
    companyCase.length > 0

  // Handle submit
  const handleSubmit = useCallback(async () => {
    await submitIdeationMutation.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      company_case: companyCase,
    })
  }, [title, description, companyCase, submitIdeationMutation])

  // Show loading state
  if (isLoadingGroup) {
    if (!isMobile) {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Loading...
              </DialogTitle>
              <DialogDescription>Memuat detail group</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Memuat detail group...</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )
    }

    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="min-h-[500px]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Loading...
            </DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="px-4 pb-4 flex-1">
            <div className="py-4">
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Memuat detail group...</p>
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-4 border-t">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                <X className="size-4 mr-2" />
                Tutup
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  // Render content JSX
  const contentJSX = (
    <div className="space-y-6">
      {/* Group Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{group?.name}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={group?.is_submitted ? 'default' : 'outline'}>
            {group?.is_submitted ? (
              <>
                <CheckCircle2 className="size-3 mr-1" />
                Sudah Submit
              </>
            ) : (
              'Belum Submit'
            )}
          </Badge>
          <Badge variant="outline">
            {memberCount}/{MIN_GROUP_SIZE} Anggota
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Group Members */}
      <GroupDetailMembers
        participants={group?.participants || []}
        creatorId={group?.creator_id as string}
        currentUserId={currentUserId}
        isSubmitted={group?.is_submitted as boolean}
        onRemoveMember={(participantId) => leaveMutation.mutate(participantId)}
        isRemoving={leaveMutation.isPending}
      />

      {/* Invite Members Section (only if not submitted and not full) */}
      {!group?.is_submitted && memberCount < MIN_GROUP_SIZE && (
        <>
          <Separator />
          <GroupDetailInvite
            selectedParticipantId={selectedParticipantId}
            onSelectParticipant={setSelectedParticipantId}
            excludeUserIds={group?.participants?.map((p) => p.id) || []}
            excludeCompany={group?.creator?.company ?? undefined}
            onInvite={() => inviteMutation.mutate(selectedParticipantId)}
            isInviting={inviteMutation.isPending}
          />
        </>
      )}

      {/* Ideation Section */}
      <Separator />

      {group?.is_submitted && group.ideation ? (
        <GroupDetailIdeationView
          ideation={group.ideation}
          submittedAt={group.submitted_at || group.ideation.submitted_at!}
        />
      ) : (
        <GroupDetailIdeationForm
          title={title}
          description={description}
          companyCase={companyCase}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onCompanyCaseChange={setCompanyCase}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          isFormValid={isFormValid}
          isSubmitting={submitIdeationMutation.isPending}
          memberCount={memberCount}
          minimumTitleLength={MINIMUM_TITLE_LENGTH}
          minimumDescriptionLength={MINIMUM_DESCRIPTION_LENGTH}
        />
      )}
    </div>
  )

  // Render Dialog for desktop
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Detail Group
            </DialogTitle>
            <DialogDescription>
              Kelola anggota dan submit ideation group
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">{contentJSX}</div>
        </DialogContent>
      </Dialog>
    )
  }

  // Render Drawer (bottom sheet) for mobile
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Detail Group
          </DrawerTitle>
          <DrawerDescription className='text-left'>Kelola anggota dan submit ideation group</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">{contentJSX}</div>
        <DrawerFooter className="pt-4 border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              <X className="size-4 mr-2" />
              Tutup
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default GroupDetailDialog
