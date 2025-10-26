import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@repo/react-components/ui'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="py-12 bg-card">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            About Template
          </h1>
          <p className="text-muted-foreground">
            XSavoryLab internal React template
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Standards</CardTitle>
              <CardDescription>
                Organization conventions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">• kebab-case naming</p>
              <p className="text-muted-foreground">• Shared @repo/react-components</p>
              <p className="text-muted-foreground">• Tailwind CSS 4</p>
              <p className="text-muted-foreground">• TypeScript strict</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🚀 Features</CardTitle>
              <CardDescription>
                Built-in tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">• Vite HMR</p>
              <p className="text-muted-foreground">• TanStack Router</p>
              <p className="text-muted-foreground">• ESLint + Prettier</p>
              <p className="text-muted-foreground">• Component library</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Component Examples
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-md mx-auto">
            <div className="space-y-2">
              <Button className="w-full">Primary</Button>
              <Button variant="outline" className="w-full">Outline</Button>
            </div>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full">Secondary</Button>
              <Button variant="ghost" className="w-full">Ghost</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}