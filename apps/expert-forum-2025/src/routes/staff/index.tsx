import { createFileRoute } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/staff/')({
  component: StaffIndexPage,
  pendingComponent: PageLoader,
})

function StaffIndexPage() {
  return (
    <div>StaffIndexPage</div>
  )
}

export default StaffIndexPage