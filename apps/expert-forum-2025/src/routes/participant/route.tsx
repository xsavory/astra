import { Outlet, createFileRoute } from '@tanstack/react-router'

import ParticipantPageLayout from 'src/components/participant-page-layout'
import PageLoader from 'src/components/page-loader'
import { requireParticipant, requireActiveEventAndCheckedIn } from 'src/lib/route-guards'

export const Route = createFileRoute('/participant')({
  component: ParticipantRoute,
  pendingComponent: PageLoader,
  beforeLoad: async ({ context, location }) => {
    const user = await requireParticipant(
      context.auth,
      location.pathname,
      location.search
    )

    // Check if user is checked in and event is active for sub-routes
    await requireActiveEventAndCheckedIn(context.queryClient, user, location.pathname)

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
