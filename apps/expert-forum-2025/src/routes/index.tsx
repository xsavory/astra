import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@repo/react-components/ui'
import { ArrowRight } from 'lucide-react'

import LoginDialog from 'src/components/login-dialog'
import useAuth from 'src/hooks/use-auth'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleNavigateToRole = () => {
    if (!user) return

    if (user.role === 'admin') {
      navigate({ to: '/admin' })
    } else if (user.role === 'staff') {
      navigate({ to: '/staff' })
    } else if (user.role === 'participant') {
      navigate({ to: '/participant' })
    }
  }

  const getRoleLabel = () => {
    if (!user) return ''

    if (user.role === 'admin') return 'Admin Portal'
    if (user.role === 'staff') return 'Staff Portal'
    if (user.role === 'participant') return 'Participant Portal'
    return 'Portal'
  }

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

        {/* CTA - Login or Navigate to Role */}
        <div className="space-y-4">
          {isAuthenticated && user ? (
            <>
              <p className="text-sm text-muted-foreground">
                Welcome back, <span className="font-semibold">{user.name}</span>!
              </p>
              <Button
                onClick={handleNavigateToRole}
                size="lg"
                className="w-full gap-2"
              >
                Masuk ke {getRoleLabel()}
                <ArrowRight className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <LoginDialog />
              <p className="text-sm text-muted-foreground">
                Hybrid Event: Offline + Online Participation
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
