import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import PageLoader from 'src/components/page-loader'
import CollaborationOfflinePage from 'src/components/collaboration-offline-page'
import CollaborationOnlinePage from 'src/components/collaboration-online-page'
import api from 'src/lib/api'
import type { User } from 'src/types/schema'

// Define search params type
type GroupSearchParams = {
  group_id?: string
  ideation_id?: string
}

export const Route = createFileRoute('/participant/collaboration')({
  component: ParticipantCollaborationPage,
  pendingComponent: PageLoader,
  validateSearch: (search: Record<string, unknown>): GroupSearchParams => {
    return {
      group_id: typeof search.group_id === 'string' ? search.group_id : undefined,
      ideation_id: typeof search.ideation_id === 'string' ? search.ideation_id : undefined,
    }
  },
})

function ParticipantCollaborationPage() {
  // Fetch current user
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.getCurrentUser(),
  })

  // Show loading state
  if (isLoading || !user) {
    return <PageLoader />
  }

  // Conditional render based on participant type
  if (user.participant_type === 'offline') {
    return <CollaborationOfflinePage user={user} />
  }

  return <CollaborationOnlinePage user={user} />
}

export default ParticipantCollaborationPage