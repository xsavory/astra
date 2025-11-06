import { createFileRoute, redirect } from '@tanstack/react-router'
import { useIsMobile } from '@repo/react-components/hooks'

import LoginDialog from 'src/components/login-dialog'
import PageLoader from 'src/components/page-loader'

import bgImage from 'src/assets/background.png'
import bgMobileImage from 'src/assets/background-mobile.png'
import robotImage from 'src/assets/robot-image.png'
import logoHeadline from 'src/assets/logo-headline.png'
import logoAstra from 'src/assets/logo-astra.png'
import logoSatuIndonesia from 'src/assets/logo-satu-indonesia.png'

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
  const isMobile = useIsMobile()
  
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={isMobile ? bgMobileImage : bgImage}
          alt="Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background/50" />
      </div>

      {/* Robot Image - Bottom Right */}
      <div className="absolute bottom-0 right-0 z-10">
        <img
          src={robotImage}
          alt="Innovation Robot"
          className="w-auto object-contain drop-shadow-2xl sm:h-[55vh] lg:h-[60vh]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex h-full flex-col">
        {/* Header with Logos */}
        <header className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <img
              src={logoAstra}
              alt="Astra"
              className="h-6 w-auto sm:h-8 md:h-10"
            />
            <img
              src={logoSatuIndonesia}
              alt="Satu Indonesia"
              className="h-6 w-auto sm:h-8 md:h-10"
            />
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex flex-1 items-center mb-32 px-6 sm:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl space-y-6 lg:space-y-8">
              {/* Event Logo/Headline */}
              <div>
                <img
                  src={logoHeadline}
                  alt="The 9th Expert Forum"
                  className="h-auto w-full max-w-lg"
                />
              </div>

              {/* Login Section */}
              <div className='w-full lg:w-3/4'>
                <LoginDialog />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
