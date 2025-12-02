import { RouterProvider, createRouter } from '@tanstack/react-router'

import PageLoader from 'src/components/page-loader'
import { routeTree } from './routeTree.gen'

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  scrollRestoration: true,
  defaultPreload: 'intent',
  defaultPreloadDelay: 100,
  defaultPendingComponent: PageLoader,
})

export default function AppRouter() {

  return (
    <RouterProvider router={router} />
  )
}