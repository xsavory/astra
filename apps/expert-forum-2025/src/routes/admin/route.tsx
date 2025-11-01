import { Outlet, createFileRoute } from '@tanstack/react-router'

import AdminPageLayout from 'src/components/admin-page-layout'
import PageLoader from 'src/components/page-loader'
import { requireAdmin } from 'src/lib/route-guards'

export const Route = createFileRoute('/admin')({
  component: AdminRoute,
  pendingComponent: PageLoader,
  beforeLoad: async ({ context, location }) => {
    const user = await requireAdmin(
      context.auth,
      location.pathname,
      location.search
    )
    return { user }
  },
})

function AdminRoute() {
  return (
    <AdminPageLayout>
      <Outlet />
    </AdminPageLayout>
  )
}
