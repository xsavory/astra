import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
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
import useAuth from 'src/hooks/use-auth'

export default function LoginDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
    setError(null)

    if (!password) return

    // Handle admin/staff login
    handleAdminStaffLogin()
  }

  const handleParticipantLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use hardcoded password from env for participants
      const participantPassword = import.meta.env.VITE_PARTICIPANT_DEFAULT_PASSWORD
      const { user } = await login(email, participantPassword)

      // Close dialog and redirect
      setOpen(false)

      // Redirect based on role
      if (user.role === 'participant') {
        navigate({ to: '/participant' })
      } else {
        // Fallback if somehow user is not a participant
        navigate({ to: '/' })
      }
    } catch (err) {
      console.error('Participant login error:', err)
      setError(err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminStaffLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { user } = await login(email, password)

      // Close dialog and redirect
      setOpen(false)

      // Redirect based on role
      if (user.role === 'admin') {
        navigate({ to: '/admin' })
      } else if (user.role === 'staff') {
        navigate({ to: '/staff' })
      } else {
        // Fallback
        navigate({ to: '/' })
      }
    } catch (err) {
      console.error('Admin/Staff login error:', err)
      setError(err instanceof Error ? err.message : 'Login gagal. Periksa email dan password Anda.')
    } finally {
      setIsLoading(false)
    }
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
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

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
