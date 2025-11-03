import { memo } from 'react'
import { Building2, Calendar } from 'lucide-react'
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@repo/react-components/ui'
import type { Ideation } from 'src/types/schema'

interface GroupDetailIdeationViewProps {
  ideation: Ideation
  submittedAt: string
}

const GroupDetailIdeationView = memo(function GroupDetailIdeationView({
  ideation,
  submittedAt,
}: GroupDetailIdeationViewProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Ideation yang Disubmit</h4>

      <div>
        <Badge variant="outline" className="text-sm mb-3">
          <Building2 className="size-3 mr-1" />
          {ideation.company_case}
        </Badge>
      </div>

      <div className="space-y-2">
        <h5 className="text-base font-semibold">Judul</h5>
        <p className="text-sm">{ideation.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Deskripsi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {ideation.description}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="size-3" />
        <span>
          Submitted: {new Date(submittedAt).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  )
})

export default GroupDetailIdeationView
