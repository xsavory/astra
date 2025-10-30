import { RouterProvider, createRouter } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'
import { routeTree } from './routeTree.gen'
import useAuth from 'src/hooks/use-auth'

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { auth: undefined },
  defaultPendingComponent: PageLoader,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 100,
})

export default function AppRouter() {
  const auth = useAuth()

  return (
    <RouterProvider router={router} context={{ auth }} />
  )
}