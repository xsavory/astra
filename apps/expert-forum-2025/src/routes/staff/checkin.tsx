import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { QrCode } from 'lucide-react'

import PageLoader from 'src/components/page-loader'
import StaffEventQRScannerDialog from 'src/components/staff-event-qr-scanner-dialog'
import CheckinGreetingAnimation from 'src/components/checkin-greeting-animation'
import CheckinErrorDialog from 'src/components/checkin-error-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@repo/react-components/ui'
import api from 'src/lib/api'
import useAuth from 'src/hooks/use-auth'

export const Route = createFileRoute('/staff/checkin')({
  component: StaffCheckinPage,
  pendingComponent: PageLoader,
})

function StaffCheckinPage() {
  const { user: staff } = useAuth()
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [greetingData, setGreetingData] = useState<{ name: string } | null>(null)
  const [errorData, setErrorData] = useState<{ message: string; participantName?: string } | null>(null)

  // Event check-in mutation
  const checkinMutation = useMutation({
    mutationFn: async (data: { participantId: string; staffId: string; participantName: string }) => {
      return api.checkins.checkinEvent(data.participantId, 'qr', data.staffId)
    },
    onSuccess: (user) => {
      console.log('Check-in successful:', user)
      // Show greeting dialog
      setGreetingData({ name: user.name })
    },
    onError: (error, variables) => {
      console.error('Check-in error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat check-in'
      // Show error dialog
      setErrorData({
        message: errorMessage,
        participantName: variables.participantName,
      })
    },
  })

  // Handler: Successful QR scan
  const handleScanSuccess = (participantData: { participantId: string; name: string }) => {
    if (!staff?.id) {
      setErrorData({
        message: 'Staff ID tidak ditemukan',
        participantName: participantData.name,
      })
      return
    }

    console.log('Participant scanned:', participantData)

    // Perform check-in
    checkinMutation.mutate({
      participantId: participantData.participantId,
      staffId: staff.id,
      participantName: participantData.name,
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Event Check-in</h1>
        <p className="text-muted-foreground">
          Scan QR code peserta untuk melakukan check-in ke event
        </p>
      </div>

      {/* Main Action Card */}
      <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <QrCode className="size-6" />
            Scan QR Code
          </CardTitle>
          <CardDescription>
            Minta peserta untuk menunjukkan QR code mereka
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            size="lg"
            onClick={() => setIsScannerOpen(true)}
            disabled={checkinMutation.isPending}
            className="w-full text-lg h-14"
          >
            <QrCode className="mr-2 size-5" />
            Buka Scanner
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Pastikan QR code terlihat jelas dan tidak terpotong</p>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Dialog */}
      <StaffEventQRScannerDialog
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onScanSuccess={handleScanSuccess}
      />

      {/* Greeting Dialog */}
      <CheckinGreetingAnimation
        open={!!greetingData}
        participantName={greetingData?.name || ''}
        onOpenChange={(open) => {
          if (!open) setGreetingData(null)
        }}
        duration={2000}
      />

      {/* Error Dialog */}
      <CheckinErrorDialog
        open={!!errorData}
        onOpenChange={(open) => {
          if (!open) setErrorData(null)
        }}
        errorMessage={errorData?.message || ''}
        participantName={errorData?.participantName}
      />
    </div>
  )
}

export default StaffCheckinPage