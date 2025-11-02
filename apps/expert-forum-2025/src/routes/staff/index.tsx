import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CheckSquare, HelpCircle, Gift, ArrowRight } from 'lucide-react'

import PageLoader from 'src/components/page-loader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@repo/react-components/ui'
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Selamat Datang, {user?.name}!
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Staff Portal untuk Expert Forum 2025. Pilih menu di bawah untuk mulai mengelola event.
        </p>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {menuCards.map((menu) => {
          const Icon = menu.icon
          return (
            <Card
              key={menu.path}
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
              onClick={() => navigate({ to: menu.path })}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${menu.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`size-6 ${menu.color}`} />
                </div>
                <CardTitle className="text-xl">{menu.title}</CardTitle>
                <CardDescription className="text-sm">
                  {menu.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full gap-2 group">
                  Buka Menu
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Gunakan menu navigasi di atas untuk berpindah antar halaman dengan cepat
            </p>
            <p className="text-xs text-muted-foreground">
              Jika mengalami kendala, silakan hubungi admin event
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StaffIndexPage