import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import type { AuthContextType } from 'src/contexts/auth'

interface RootRouterContext {
  auth: AuthContextType | undefined,
}

export const Route = createRootRouteWithContext<RootRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})
