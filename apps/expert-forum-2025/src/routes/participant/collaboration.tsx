import { createFileRoute } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/participant/collaboration')({
  component: ParticipantCollaborationPage,
  pendingComponent: PageLoader,
})

function ParticipantCollaborationPage() {
  return (
    <div>ParticipantCollaborationPage</div>
  )
}

export default ParticipantCollaborationPage