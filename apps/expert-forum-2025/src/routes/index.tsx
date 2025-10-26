import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@repo/react-components/ui'

import { LandingBanner } from 'src/components/landing-banner'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div>
      <LandingBanner />

      <section className="py-8 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Base Tech Stack
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>⚡ Vite</CardTitle>
                <CardDescription>
                  Fast build tool with HMR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Lightning fast development server
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎨 Tailwind CSS</CardTitle>
                <CardDescription>
                  Utility-first CSS framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Rapid UI development
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🛣️ TanStack Router</CardTitle>
                <CardDescription>
                  Type-safe routing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Modern React routing solution
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button>Start Building</Button>
          </div>
        </div>
      </section>
    </div>
  )
}