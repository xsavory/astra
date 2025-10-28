import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@repo/react-components/ui'

import { LandingBanner } from 'src/components/landing-banner'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div>
      Index
    </div>
  )
}