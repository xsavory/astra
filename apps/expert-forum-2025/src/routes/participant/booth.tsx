import { createFileRoute } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/participant/booth')({
  component: ParticipantBoothPage,
  pendingComponent: PageLoader,
})

function ParticipantBoothPage() {
  return (
    <div>ParticipantBoothPage</div>
  )
}

export default ParticipantBoothPage