import { createFileRoute } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/participant/')({
  component: ParticipantIndexPage,
  pendingComponent: PageLoader,
})

function ParticipantIndexPage() {
  return (
    <div>ParticipantIndexPage</div>
  )
}

export default ParticipantIndexPage