import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import type { AuthContextType } from 'src/contexts/auth'

interface RootRouterContext {
  auth: AuthContextType | undefined,
  queryClient: QueryClient,
}

export const Route = createRootRouteWithContext<RootRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})
