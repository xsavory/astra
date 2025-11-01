import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QrCode, LogIn, Loader2 } from 'lucide-react'

import ParticipantQRDialog from 'src/components/participant-qr-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  toast,
} from '@repo/react-components/ui'
import api from 'src/lib/api'
import type { User } from 'src/types/schema'

interface ParticipantPreCheckinPageProps {
  user: User
}

function ParticipantPreCheckinPage({ user }: ParticipantPreCheckinPageProps) {
  const queryClient = useQueryClient()
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)

  // Manual check-in mutation for online participants
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not found')
      return api.checkins.checkinEvent(user.id, 'manual')
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })

      toast.success('Check-in berhasil! Selamat datang di Expert Forum 2025')
    },
    onError: (error) => {
      toast.warning(error instanceof Error ? error.message : 'Terjadi kesalahan saat check-in')
    },
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Selamat Datang!</CardTitle>
          <CardDescription>
            {user.name}
          </CardDescription>
          <Badge
            variant={user.participant_type === 'offline' ? 'default' : 'secondary'}
            className="mx-auto mt-2"
          >
            {user.participant_type === 'offline' ? 'Offline' : 'Online'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {user.participant_type === 'offline'
              ? 'Tunjukkan QR Code Anda kepada staff untuk melakukan check-in'
              : 'Klik tombol di bawah untuk melakukan check-in dan mengakses event'
            }
          </p>

          {user.participant_type === 'offline' ? (
            // Offline: Show QR button
            <Button
              onClick={() => setIsQRDialogOpen(true)}
              size="lg"
              className="w-full"
            >
              <QrCode className="mr-2 size-5" />
              Tampilkan QR Code
            </Button>
          ) : (
            // Online: Show Check-in button
            <Button
              onClick={() => checkInMutation.mutate()}
              disabled={checkInMutation.isPending}
              size="lg"
              className="w-full"
            >
              {checkInMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 size-5" />
                  Check-in Sekarang
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* QR Dialog for offline participants */}
      {user.participant_type === 'offline' && (
        <ParticipantQRDialog
          user={user}
          open={isQRDialogOpen}
          onOpenChange={setIsQRDialogOpen}
        />
      )}
    </div>
  )
}

export default ParticipantPreCheckinPage
