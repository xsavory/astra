import { LogOut } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@repo/react-components/ui'
import useAuth from 'src/hooks/use-auth'

interface Props {
  children: React.ReactNode
}

function ParticipantPageLayout({ children }: Props) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate({ to: '/' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with logout - Mobile optimized */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold sm:text-xl truncate">
              Expert Forum 2025
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {user?.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 sm:gap-2 shrink-0"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main content - Full height with proper spacing */}
      <main className="flex-1 container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        {children}
      </main>

      {/* Footer - Simple branding */}
      <footer className="border-t py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2025 Astra Group. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default ParticipantPageLayout