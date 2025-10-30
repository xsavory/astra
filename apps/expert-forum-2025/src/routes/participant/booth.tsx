import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import PageLoader from 'src/components/page-loader'
import BoothOfflinePage from 'src/components/booth-offline-page'
import BoothOnlinePage from 'src/components/booth-online-page'
import api from 'src/lib/api'
import type { User } from 'src/types/schema'

// Define search params type
type BoothSearchParams = {
  booth_id?: string
}

export const Route = createFileRoute('/participant/booth')({
  component: ParticipantBoothPage,
  pendingComponent: PageLoader,
  validateSearch: (search: Record<string, unknown>): BoothSearchParams => {
    return {
      booth_id: typeof search.booth_id === 'string' ? search.booth_id : undefined,
    }
  },
})

function ParticipantBoothPage() {
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
    return <BoothOfflinePage user={user} />
  }

  return <BoothOnlinePage user={user} />
}

export default ParticipantBoothPage