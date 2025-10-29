import { createFileRoute } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/staff/checkin')({
  component: StaffCheckinPage,
  pendingComponent: PageLoader,
})

function StaffCheckinPage() {
  return (
    <div>StaffCheckinPage</div>
  )
}

export default StaffCheckinPage