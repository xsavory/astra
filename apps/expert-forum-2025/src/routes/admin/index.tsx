import { createFileRoute } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/admin')({
  component: AdminIndexPage,
  pendingComponent: PageLoader,
})

function AdminIndexPage() {
  return (
    <div>AdminIndexPage</div>
  )
}

export default AdminIndexPage