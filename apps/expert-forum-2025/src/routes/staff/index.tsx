import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CheckSquare, HelpCircle, Gift, ArrowRight } from 'lucide-react'

import PageLoader from 'src/components/page-loader'
import { Card, CardContent, Button } from '@repo/react-components/ui'
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
      description: 'Scan QR codes dan kelola check-in peserta untuk booth dan session',
      icon: CheckSquare,
      path: '/staff/checkin',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Helpdesk',
      description: 'Bantu peserta dengan pertanyaan dan masalah teknis',
      icon: HelpCircle,
      path: '/staff/helpdesk',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'Lucky Draw',
      description: 'Kelola undian berhadiah untuk peserta event',
      icon: Gift,
      path: '/staff/draw',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
  ]

  return (
    <div className="space-y-8 mx-auto container px-4 py-6">
      {/* Hero Section */}
      <h1 className="text-xl font-bold text-center">
        Selamat Datang, {user?.name}!
      </h1>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {menuCards.map((menu) => {
          const Icon = menu.icon
          return (
            <Card
              key={menu.path}
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
              onClick={() => navigate({ to: menu.path })}
            >
              <CardContent>
                <div className='flex justify-between items-center'>
                  <div className='flex gap-2 items-center'>
                    <div className={`w-12 h-12 rounded-lg ${menu.bgColor} flex items-center justify-center`}>
                      <Icon className={`size-6 ${menu.color}`} />
                    </div>
                    {menu.title}
                  </div>
                  <Button variant="secondary" className="gap-2 group cursor-pointer">
                    Buka Menu
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default StaffIndexPage