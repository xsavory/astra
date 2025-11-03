import { memo } from 'react'
import { UserMinus } from 'lucide-react'
import { Card, CardContent, Badge, Button } from '@repo/react-components/ui'
import type { User } from 'src/types/schema'

interface GroupDetailMembersProps {
  participants: User[]
  creatorId: string
  currentUserId: string
  isSubmitted: boolean
  onRemoveMember: (participantId: string) => void
  isRemoving: boolean
}

const GroupDetailMembers = memo(function GroupDetailMembers({
  participants,
  creatorId,
  currentUserId,
  isSubmitted,
  onRemoveMember,
  isRemoving,
}: GroupDetailMembersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Anggota Group</h4>
      </div>

      <div className="space-y-2">
        {participants.map((participant) => {
          const isMember = participant.id === currentUserId
          const isGroupCreator = participant.id === creatorId

          return (
            <Card key={participant.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {participant.name}
                      {isGroupCreator && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Leader
                        </Badge>
                      )}
                      {isMember && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {participant.company || 'No company'}
                    </p>
                  </div>

                  {/* Leave/Remove button logic */}
                  {!isSubmitted && (
                    <>
                      {/* Leave button for non-creator members */}
                      {(!isGroupCreator && isMember) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onRemoveMember(participant.id)}
                          disabled={isRemoving}
                          title="Keluar dari group"
                        >
                          <UserMinus className="size-4" /> Leave
                        </Button>
                      )}

                      {/* Remove button for creator (to remove other members) */}
                      {!isMember && currentUserId === creatorId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveMember(participant.id)}
                          disabled={isRemoving}
                          title="Hapus dari group"
                        >
                          <UserMinus className="size-4" /> Remove
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
})

export default GroupDetailMembers
