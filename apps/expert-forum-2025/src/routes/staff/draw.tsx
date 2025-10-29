import { createFileRoute } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/staff/draw')({
  component: StaffDrawPage,
  pendingComponent: PageLoader,
})

function StaffDrawPage() {
  return (
    <div>StaffDrawPage</div>
  )
}

export default StaffDrawPage