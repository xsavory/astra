import { createFileRoute, redirect } from '@tanstack/react-router'

import LoginDialog from 'src/components/login-dialog'
import PageLoader from 'src/components/page-loader'

export const Route = createFileRoute('/')({
  component: Landing,
  pendingComponent: PageLoader,
  beforeLoad: async ({ context }) => {
    // Check if user is already authenticated
    const user = await context.auth?.initAuth()

    // Auto-redirect to user's portal if authenticated
    if (user) {
      if (user.role === 'admin') {
        throw redirect({ to: '/admin' })
      } else if (user.role === 'staff') {
        throw redirect({ to: '/staff' })
      } else if (user.role === 'participant') {
        throw redirect({ to: '/participant' })
      }
    }

    return { user }
  },
})

function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Event Branding */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Expert Forum 2025
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome to Astra Group's Corporate Event Platform
          </p>
        </div>

        {/* Login CTA - Only shown to guests */}
        <div className="space-y-4">
          <LoginDialog />
          <p className="text-sm text-muted-foreground">
            Hybrid Event: Offline + Online Participation
          </p>
        </div>
      </div>
    </div>
  )
}
