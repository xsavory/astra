import { LogOut } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@repo/react-components/ui'
import useAuth from 'src/hooks/use-auth'

interface Props {
  children: React.ReactNode
}

function StaffPageLayout({ children }: Props) {
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
    <div className="min-h-screen">
      {/* Header with logout */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">Staff Portal</h1>
            {user && <p className="text-sm text-muted-foreground">{user.name}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}

export default StaffPageLayout