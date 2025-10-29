import { Outlet, createFileRoute } from '@tanstack/react-router'

import AdminPageLayout from 'src/components/admin-page-layout'
import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/admin')({
  component: AdminRoute,
  pendingComponent: PageLoader,
})

function AdminRoute() {
  return (
    <AdminPageLayout>
      <Outlet />
    </AdminPageLayout>
  )
}