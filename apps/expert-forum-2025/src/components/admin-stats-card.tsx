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
}

function AdminStatsCard({
  title,
  value,
  badges = [],
  icon: Icon,
  isLoading = false,
}: AdminStatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-[140px]" />
          </CardTitle>
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[80px] mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-[70px]" />
            <Skeleton className="h-5 w-[70px]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString('id-ID')}</div>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {badge.label}: {badge.value}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminStatsCard
