import { memo } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@repo/react-components/ui'
import ParticipantSearchSelector from './collaboration-participant-search'

interface GroupDetailInviteProps {
  selectedParticipantId: string
  onSelectParticipant: (participantId: string) => void
  excludeUserIds: string[]
  excludeCompany?: string
  onInvite: () => void
  isInviting: boolean
}

const GroupDetailInvite = memo(function GroupDetailInvite({
  selectedParticipantId,
  onSelectParticipant,
  excludeUserIds,
  excludeCompany,
  onInvite,
  isInviting,
}: GroupDetailInviteProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Undang Anggota</h4>

      {/* Participant Selector */}
      <ParticipantSearchSelector
        selectedParticipantId={selectedParticipantId}
        onSelectParticipant={onSelectParticipant}
        excludeUserIds={excludeUserIds}
        excludeCompany={excludeCompany}
        label="Undang Anggota Baru"
        placeholder="Cari participant..."
        searchPlaceholder="Cari berdasarkan nama, email, atau company"
        emptyResultMessage="Tidak ada participant yang sesuai pencarian"
      />

      {/* Invite Button */}
      {selectedParticipantId && (
        <Button
          onClick={onInvite}
          disabled={isInviting}
          className="w-full"
        >
          {isInviting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Mengundang...
            </>
          ) : (
            <>
              <UserPlus className="size-4 mr-2" />
              Undang Participant
            </>
          )}
        </Button>
      )}
    </div>
  )
})

export default GroupDetailInvite
