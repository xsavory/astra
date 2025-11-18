import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CheckSquare, HelpCircle, Gift, Award, ArrowRight, Sparkles } from 'lucide-react'

import PageLoader from 'src/components/page-loader'
import { Card, CardContent } from '@repo/react-components/ui'
import useAuth from 'src/hooks/use-auth'

export const Route = createFileRoute('/staff/')({
  component: StaffIndexPage,
  pendingComponent: PageLoader,
})

function StaffIndexPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const menuCards = [
    {
      title: 'Check-in Management',
      description: 'Manage participant check-ins',
      icon: CheckSquare,
      path: '/staff/checkin',
      gradient: 'from-primary/20 via-blue-500/10 to-transparent',
      iconColor: 'text-primary',
      borderGlow: 'hover:shadow-primary/20',
    },
    {
      title: 'Helpdesk',
      description: 'Assist participants with inquiries',
      icon: HelpCircle,
      path: '/staff/helpdesk',
      gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
      iconColor: 'text-emerald-500',
      borderGlow: 'hover:shadow-emerald-500/20',
    },
    {
      title: 'Lucky Draw',
      description: 'Manage prize draws and winners',
      icon: Gift,
      path: '/staff/draw',
      gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
      iconColor: 'text-purple-500',
      borderGlow: 'hover:shadow-purple-500/20',
    },
    {
      title: 'Votes Management',
      description: 'Monitor voting and results',
      icon: Award,
      path: '/staff/votes',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      iconColor: 'text-amber-500',
      borderGlow: 'hover:shadow-amber-500/20',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="mx-auto container px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Sparkles className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">Staff Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Welcome, {user?.name}!
          </h1>
          <p className="text-sm text-muted-foreground">Select a module to get started</p>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menuCards.map((menu) => {
            const Icon = menu.icon
            return (
              <Card
                key={menu.path}
                className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/30 ${menu.borderGlow} overflow-hidden relative`}
                onClick={() => navigate({ to: menu.path })}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${menu.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <CardContent className="relative p-5">
                  <div className='flex items-start gap-4'>
                    {/* Icon Container */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${menu.gradient} border border-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`size-7 ${menu.iconColor}`} />
                    </div>

                    {/* Text Content */}
                    <div className='flex-1 min-w-0'>
                      <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                        {menu.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {menu.description}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Stats or Info Section */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
          <p className="text-sm text-center text-muted-foreground">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StaffIndexPage
