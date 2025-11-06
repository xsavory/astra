import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@repo/react-components/ui'
import { requiresPasswordInput, requiresOTPLogin } from 'src/lib/constants'
import { getRedirectUrl } from 'src/lib/route-guards'
import useAuth from 'src/hooks/use-auth'
import api from 'src/lib/api'
import AppButton from './app-button'

type LoginStep = 'email' | 'password' | 'otp'

export default function LoginDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [currentStep, setCurrentStep] = useState<LoginStep>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isLoggingIn = useRef(false)

  const { login, user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { redirect?: string; search?: string }

  // Redirect based on role
  useEffect(() => {
    // Only handle redirect if we're in the middle of login process
    if (!isLoggingIn.current || !isAuthenticated || !user || isAuthLoading) {
      return
    }

    // Reset flag
    isLoggingIn.current = false
    setIsLoading(false)

    // Close dialog
    setOpen(false)

    // Get redirect URL based on role and search params
    const redirectUrl = getRedirectUrl(user, searchParams.redirect, searchParams.search)
    navigate(redirectUrl)
  }, [user, isAuthenticated, navigate, isAuthLoading, searchParams])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) return

    // Check if email requires OTP (admin)
    if (requiresOTPLogin(email)) {
      setIsLoading(true)
      try {
        // Request OTP for admin
        await api.auth.requestOTP(email)
        setCurrentStep('otp')
        setIsLoading(false)
      } catch (err) {
        console.error('OTP request error:', err)
        setError(err instanceof Error ? err.message : 'Gagal mengirim OTP. Silakan coba lagi.')
        setIsLoading(false)
      }
    } else if (requiresPasswordInput(email)) {
      // Staff or Participant - show password field
      setCurrentStep('password')
    } else {
      setError('Email tidak terdaftar.')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password) return

    setIsLoading(true)
    isLoggingIn.current = true

    try {
      await login(email, password)
      // Redirect will be handled by useEffect when user state updates
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Login gagal. Periksa email dan password Anda.')
      isLoggingIn.current = false
      setIsLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!otpCode) return

    setIsLoading(true)
    isLoggingIn.current = true

    try {
      await api.auth.verifyOTP(email, otpCode)
      // Redirect will be handled by useEffect when user state updates
    } catch (err) {
      console.error('OTP verification error:', err)
      setError(err instanceof Error ? err.message : 'Kode OTP tidak valid. Silakan coba lagi.')
      isLoggingIn.current = false
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when dialog closes
      setEmail('')
      setPassword('')
      setOtpCode('')
      setCurrentStep('email')
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className='justify-center flex w-full'>
        <AppButton size="lg" className="w-full text-lg">
          Login
        </AppButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className='text-primary'>Login</DialogTitle>
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

          {currentStep === 'email' && (
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

              <AppButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                {isLoading ? 'Memproses...' : 'Lanjutkan'}
              </AppButton>
            </form>
          )}

          {currentStep === 'password' && (
            // Password input step (for staff/participant)
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
                <AppButton
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setCurrentStep('email')
                    setPassword('')
                    setError(null)
                  }}
                >
                  Kembali
                </AppButton>
                <AppButton type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isLoading ? 'Memproses...' : 'Login'}
                </AppButton>
              </div>
            </form>
          )}

          {currentStep === 'otp' && (
            // OTP input step (for admin)
            <form onSubmit={handleOTPSubmit} className="space-y-4">
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
                <Label htmlFor="otp">Kode OTP</Label>
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) => setOtpCode(value)}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-xs text-muted-foreground">
                  Kode OTP telah dikirim ke email Anda
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setCurrentStep('email')
                    setOtpCode('')
                    setError(null)
                  }}
                >
                  Kembali
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading || otpCode.length !== 6}>
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isLoading ? 'Memproses...' : 'Verifikasi'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
