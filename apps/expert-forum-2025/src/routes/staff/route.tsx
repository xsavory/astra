import { Outlet, createFileRoute } from '@tanstack/react-router'

import StaffPageLayout from 'src/components/staff-page-layout'
import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/staff')({
  component: StaffRoute,
  pendingComponent: PageLoader,
})

function StaffRoute() {
  return (
    <StaffPageLayout>
      <Outlet />
    </StaffPageLayout>
  )
}