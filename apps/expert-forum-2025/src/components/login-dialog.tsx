import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/react-components/ui'
import { requiresPasswordInput } from 'src/lib/constants'

export default function LoginDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    // Check if email requires password (admin/staff)
    if (requiresPasswordInput(email)) {
      setShowPasswordField(true)
    } else {
      // Participant - proceed to login
      handleParticipantLogin()
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) return

    // Handle admin/staff login
    handleAdminStaffLogin()
  }

  const handleParticipantLogin = () => {
    setIsLoading(true)
    // TODO: Implement participant login with hardcoded password
    console.log('Participant login:', email)
    setTimeout(() => {
      setIsLoading(false)
      // TODO: Redirect to /participant
    }, 1000)
  }

  const handleAdminStaffLogin = () => {
    setIsLoading(true)
    // TODO: Implement admin/staff login with password
    console.log('Admin/Staff login:', { email, password })
    setTimeout(() => {
      setIsLoading(false)
      // TODO: Redirect based on role
    }, 1000)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when dialog closes
      setEmail('')
      setPassword('')
      setShowPasswordField(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Masukkan email Anda untuk melanjutkan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showPasswordField ? (
            // Email input step
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                {isLoading ? 'Memproses...' : 'Lanjutkan'}
              </Button>
            </form>
          ) : (
            // Password input step (for admin/staff)
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-display">Email</Label>
                <Input
                  id="email-display"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowPasswordField(false)
                    setPassword('')
                  }}
                >
                  Kembali
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isLoading ? 'Memproses...' : 'Login'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
