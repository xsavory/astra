import { Outlet, createFileRoute } from '@tanstack/react-router'

import ParticipantPageLayout from 'src/components/participant-page-layout'
import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/participant')({
  component: ParticipantRoute,
  pendingComponent: PageLoader,
})

function ParticipantRoute() {
  return (
    <ParticipantPageLayout>
      <Outlet />
    </ParticipantPageLayout>
  )
}