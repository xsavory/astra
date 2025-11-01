import { Outlet, createFileRoute } from '@tanstack/react-router'

import StaffPageLayout from 'src/components/staff-page-layout'
import PageLoader from 'src/components/page-loader'
import { requireStaff } from 'src/lib/route-guards'

export const Route = createFileRoute('/staff')({
  component: StaffRoute,
  pendingComponent: PageLoader,
  beforeLoad: async ({ context, location }) => {
    const user = await requireStaff(
      context.auth,
      location.pathname,
      location.search
    )
    return { user }
  },
})

function StaffRoute() {
  return (
    <StaffPageLayout>
      <Outlet />
    </StaffPageLayout>
  )
}
