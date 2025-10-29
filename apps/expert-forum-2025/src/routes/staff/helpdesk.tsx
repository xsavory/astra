import { createFileRoute } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/staff/helpdesk')({
  component: StaffHelpdeskPage,
  pendingComponent: PageLoader,
})

function StaffHelpdeskPage() {
  return (
    <div>StaffHelpdeskPage</div>
  )
}

export default StaffHelpdeskPage