import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { QrCode } from 'lucide-react'

import PageLoader from 'src/components/page-loader'
import StaffEventQRScannerDialog from 'src/components/staff-event-qr-scanner-dialog'
import CheckinGreetingAnimation from 'src/components/checkin-greeting-animation'
import CheckinErrorDialog from 'src/components/checkin-error-dialog'
import CheckinLoadingDialog from 'src/components/checkin-loading-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import api from 'src/lib/api'
import useAuth from 'src/hooks/use-auth'
import AppButton from 'src/components/app-button'

import bgImage from 'src/assets/background.png'
import bgMobileImage from 'src/assets/background-mobile.png'
import logoHeadline from 'src/assets/logo-headline.png'
import robotImage from 'src/assets/robot-image.png'

export const Route = createFileRoute('/staff/checkin')({
  component: StaffCheckinPage,
  pendingComponent: PageLoader,
})

function StaffCheckinPage() {
  const isMobile = useIsMobile()
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
      // Show greeting dialog
      setGreetingData({ name: user.name })
    },
    onError: (error, variables) => {
      console.error('Check-in error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during check-in'
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
        message: 'Staff ID not found',
        participantName: participantData.name,
      })
      return
    }

    // Perform check-in
    checkinMutation.mutate({
      participantId: participantData.participantId,
      staffId: staff.id,
      participantName: participantData.name,
    })
  }

  return (
    <div className='min-w-screen min-h-screen relative overflow-hidden'>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={isMobile ? bgMobileImage : bgImage}
          alt="Background"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute bottom-0 right-0">
        <img
          src={robotImage}
          alt="Innovation Robot"
          className="w-auto object-cover drop-shadow-2xl h-[45vh]"
        />
      </div>
      <div className="space-y-6 max-w-4xl mx-auto container px-4 py-16 relative">
        {/* Page Header */}
        <div className="flex justify-center shrink-0 z-15">
          <img
            src={logoHeadline}
            alt="The 9th Expert Forum"
            className="h-auto w-full max-w-xs"
          />
        </div>

        {/* Main Action Card */}
        <Card className="border-2 border border-cyan-200 hover:border-primary/50 transition-colors relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl justify-center">
              <QrCode className="size-6" />
              Scan QR Code
            </CardTitle>
            <CardDescription className='sr-only'>
              Participant showing QR Code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AppButton
              size="lg"
              onClick={() => setIsScannerOpen(true)}
              disabled={checkinMutation.isPending}
              className="w-full text-lg h-14"
            >
              <QrCode className="mr-2 size-5" />
              Open Scanner
            </AppButton>

            <div className="text-center text-sm text-muted-foreground">
              <p>Make sure QR code is clearly visible and not cut off</p>
            </div>
          </CardContent>
        </Card>

        {/* QR Scanner Dialog */}
        <StaffEventQRScannerDialog
          open={isScannerOpen}
          onOpenChange={setIsScannerOpen}
          onScanSuccess={handleScanSuccess}
        />

        {/* Loading Dialog */}
        <CheckinLoadingDialog open={checkinMutation.isPending} />

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
    </div>
  )
}

export default StaffCheckinPage