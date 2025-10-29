import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@repo/react-components/ui'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  return (
    <div>
      <div>Landing Page</div>
      <Button>Login</Button>
    </div>
  )
}