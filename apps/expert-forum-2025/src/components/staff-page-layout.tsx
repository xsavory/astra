import { LogOut, Maximize, Minimize, CheckSquare, HelpCircle, Gift, Eye, EyeOff } from 'lucide-react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { Button, Separator } from '@repo/react-components/ui'
import useAuth from 'src/hooks/use-auth'
import { useState } from 'react'

interface Props {
  children: React.ReactNode
}

function StaffPageLayout({ children }: Props) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)

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

  // Menu items
  const menuItems = [
    { path: '/staff', label: 'Dashboard', icon: null },
    { path: '/staff/checkin', label: 'Check-in', icon: CheckSquare },
    { path: '/staff/helpdesk', label: 'Helpdesk', icon: HelpCircle },
    { path: '/staff/draw', label: 'Draw', icon: Gift },
  ]

  const isActive = (path: string) => {
    if (path === '/staff') {
      return location.pathname === '/staff' || location.pathname === '/staff/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with navbar */}
      <header className={`sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Left: Brand & Menu */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">Staff Portal</h1>
              </div>

              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center gap-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => navigate({ to: item.path })}
                      className="gap-2"
                    >
                      {Icon && <Icon className="size-4" />}
                      {item.label}
                    </Button>
                  )
                })}
              </nav>
            </div>

            {/* Right: User info, Fullscreen toggle, Logout */}
            <div className="flex items-center gap-2">
              {/* User info - Hidden on mobile */}
              {user && (
                <div className="hidden lg:flex flex-col items-end mr-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}

              {/* Navbar visibility toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNavbarVisible(!isNavbarVisible)}
                className="gap-2"
              >
                {isNavbarVisible ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
                <span className="hidden sm:inline">
                  {isNavbarVisible ? 'Hide Navbar' : 'Show Navbar'}
                </span>
              </Button>

              {/* Fullscreen toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="gap-2"
              >
                {isFullscreen ? (
                  <Minimize className="size-4" />
                ) : (
                  <Maximize className="size-4" />
                )}
                <span className="hidden sm:inline">
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </span>
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Logout button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile navigation menu */}
          <nav className="flex md:hidden items-center gap-1 pb-3 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate({ to: item.path })}
                  className="gap-2 whitespace-nowrap"
                >
                  {Icon && <Icon className="size-4" />}
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Toggle button when navbar is hidden */}
      {!isNavbarVisible && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsNavbarVisible(true)}
          className="fixed top-4 right-4 z-50 gap-2 shadow-lg"
        >
          <Eye className="size-4" />
          <span className="hidden sm:inline">Show Navbar</span>
        </Button>
      )}

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}

export default StaffPageLayout