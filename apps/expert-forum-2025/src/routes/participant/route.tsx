import { Outlet, createFileRoute } from '@tanstack/react-router'

import ParticipantPageLayout from 'src/components/participant-page-layout'
import PageLoader from 'src/components/page-loader'
import { requireParticipant } from 'src/lib/route-guards'

export const Route = createFileRoute('/participant')({
  component: ParticipantRoute,
  pendingComponent: PageLoader,
  beforeLoad: async ({ context }) => {
    // This will:
    // 1. Wait for auth initialization (reuses promise, no duplicate fetch)
    // 2. Check if user has 'participant' role
    // 3. Redirect to '/' if not authenticated or wrong role
    // 4. Return user if authorized
    const user = await requireParticipant(context.auth)
    return { user }
  },
})

function ParticipantRoute() {
  return (
    <ParticipantPageLayout>
      <Outlet />
    </ParticipantPageLayout>
  )
}
