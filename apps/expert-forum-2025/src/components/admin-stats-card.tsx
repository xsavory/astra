import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from '@repo/react-components/ui'
import type { LucideIcon } from 'lucide-react'

interface StatBadge {
  label: string
  value: number
}

interface AdminStatsCardProps {
  title: string
  value: number
  badges?: StatBadge[]
  icon?: LucideIcon
  isLoading?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info'
}

function AdminStatsCard({
  title,
  value,
  badges = [],
  icon: Icon,
  isLoading = false,
  variant = 'default',
}: AdminStatsCardProps) {
  // Variant styling configurations
  const variantStyles = {
    default: {
      gradient: 'from-slate-500/20 via-slate-500/10 to-transparent',
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBg: 'bg-slate-100 dark:bg-slate-900/50',
      borderGlow: 'hover:shadow-slate-500/20',
      accentColor: 'text-slate-600',
    },
    primary: {
      gradient: 'from-primary/20 via-primary/10 to-transparent',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      borderGlow: 'hover:shadow-primary/20',
      accentColor: 'text-primary',
    },
    success: {
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      borderGlow: 'hover:shadow-emerald-500/20',
      accentColor: 'text-emerald-600',
    },
    warning: {
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
      borderGlow: 'hover:shadow-amber-500/20',
      accentColor: 'text-amber-600',
    },
    info: {
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      borderGlow: 'hover:shadow-blue-500/20',
      accentColor: 'text-blue-600',
    },
  }

  const styles = variantStyles[variant]

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-[140px]" />
          </CardTitle>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-[100px] mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-[80px] rounded-full" />
            <Skeleton className="h-6 w-[80px] rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`relative overflow-hidden border-2 shadow-lg bg-gradient-to-br ${styles.gradient}`}>
      {/* Decorative Gradient Orb */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${styles.gradient} rounded-full blur-3xl opacity-30`} />

      {/* Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.gradient} opacity-90`} />

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={`${styles.iconBg} p-2.5 rounded-xl border border-primary/10 shadow-sm`}>
            <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          </div>
        )}
      </CardHeader>

      <CardContent className="relative">
        <div className="text-3xl font-bold mb-3">
          <span className={`${styles.accentColor}`}>
            {value.toLocaleString('en-US')}
          </span>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-primary/30 shadow-sm"
              >
                <span className="font-medium">{badge.label}:</span>
                <span className="ml-1 font-bold">{badge.value}</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminStatsCard
