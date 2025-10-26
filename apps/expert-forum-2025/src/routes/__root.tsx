import { createRootRoute, Outlet } from '@tanstack/react-router'

import { Navbar } from 'src/components/navbar'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  ),
})