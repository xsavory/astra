import { Outlet, createFileRoute } from '@tanstack/react-router'

import ParticipantPageLayout from 'src/components/participant-page-layout'
import PageLoader from 'src/components/page-loader'
import { requireParticipant } from 'src/lib/route-guards'

export const Route = createFileRoute('/participant')({
  component: ParticipantRoute,
  pendingComponent: PageLoader,
  beforeLoad: async ({ context, location }) => {
    const user = await requireParticipant(
      context.auth,
      location.pathname,
      location.search
    )
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
