import { LogOut, Maximize, Minimize } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button, Separator } from '@repo/react-components/ui'
import useAuth from 'src/hooks/use-auth'
import { useState } from 'react'

import logo from 'src/assets/logo.png'

interface Props {
  children: React.ReactNode
}

function AdminPageLayout({ children }: Props) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate({ to: '/' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-card">
      {/* Header with navbar - always visible */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 py-3">
            {/* Top row: Brand & Actions */}
            <div className="flex items-center justify-between">
              {/* Left: Brand */}
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <img src={logo} alt='logo' className='w-26' />
                </div>
              </div>

              {/* Right: Actions (mobile & tablet) */}
              <div className="flex lg:hidden items-center gap-1.5">
                {/* User info - compact for tablet */}
                {user && (
                  <div className="hidden sm:flex flex-col items-end mr-2 min-w-0">
                    <p className="text-xs font-medium truncate max-w-[120px]">
                      {user.name}
                    </p>
                  </div>
                )}

                {/* Fullscreen toggle */}
                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="size-4" />
                  ) : (
                    <Maximize className="size-4" />
                  )}
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* Logout button */}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>

            {/* Bottom row: Actions (desktop) */}
            <div className="flex items-center justify-end gap-2">
              {/* User info (desktop) */}
              {user && (
                <div className="hidden lg:flex flex-col items-end mr-2 min-w-0">
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {user.email}
                  </p>
                </div>
              )}

              {/* Fullscreen toggle (desktop) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="hidden lg:flex gap-2"
              >
                {isFullscreen ? (
                  <Minimize className="size-4" />
                ) : (
                  <Maximize className="size-4" />
                )}
                <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Logout button (desktop) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden lg:flex gap-2"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

export default AdminPageLayout