import { createFileRoute } from '@tanstack/react-router'

import LoginDialog from 'src/components/login-dialog'

export const Route = createFileRoute('/')({
  component: Landing,
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

        {/* Login CTA */}
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
