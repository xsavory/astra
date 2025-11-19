import { LogOut } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@repo/react-components/ui'
// import { useIsMobile } from '@repo/react-components/hooks'
import useAuth from 'src/hooks/use-auth'
import { useState } from 'react'

import logo from 'src/assets/logo.png'
import bgHeader from 'src/assets/bg-header.png'
import headerOrnament from 'src/assets/header-ornament.png'
// import robotImage from 'src/assets/robot-image.png'

interface Props {
  children: React.ReactNode
}

function ParticipantPageLayout({ children }: Props) {
  // const isMobile = useIsMobile()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      navigate({ to: '/' })
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Loading Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-lg">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">Logging out...</p>
          </div>
        </div>
      )}

      {/* Header with logout - Mobile optimized */}
      <header className="sticky top-0 z-50 border-b relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={bgHeader}
            alt='header-background'
            className='h-full w-full object-cover'
          />
        </div>

        {/* Header Ornament - Positioned at top right */}
        <div className="absolute top-0 right-0 z-10">
          <img
            src={headerOrnament}
            alt='header-ornament'
            className='h-auto object-contain'
          />
        </div>

        {/* Content */}
        <div className="container mx-auto flex items-center justify-between px-4 md:px-24 py-4 relative z-20">
          <div className="flex-1 min-w-0">
            <img src={logo} alt='logo' className='w-28 md:w-32' />
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 sm:gap-2 shrink-0"
          >
            <LogOut className="size-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      {/* Main content - Full height with proper spacing */}
      <main className="container mx-auto px-4 md:px-24 py-4 sm:py-6 w-full">
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