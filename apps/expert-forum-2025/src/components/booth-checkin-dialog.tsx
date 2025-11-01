import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  Button,
  Textarea,
  Label,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'

interface BoothCheckinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: string
  onSubmit: (answer: string) => Promise<void>
  isSubmitting: boolean
}

const MINIMUM_ANSWER_LENGTH = 20

function BoothCheckinDialog({
  open,
  onOpenChange,
  question,
  onSubmit,
  isSubmitting,
}: BoothCheckinDialogProps) {
  const isMobile = useIsMobile()
  const [answer, setAnswer] = useState('')

  // Reset answer when dialog closes
  useEffect(() => {
    if (!open) {
      setAnswer('')
    }
  }, [open])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    await onSubmit(answer.trim())
  }, [answer, onSubmit])

  const questionContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="answer">Pertanyaan Check-in</Label>
        <p className="text-sm text-muted-foreground">
          {question}
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          id="answer"
          placeholder="Tuliskan jawaban Anda di sini..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Minimal {MINIMUM_ANSWER_LENGTH} karakter
        </p>
      </div>
    </div>
  )

  // Render Drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Check-in ke Booth</DrawerTitle>
            <DrawerDescription>
              Jawab pertanyaan berikut untuk check-in
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {questionContent}
          </div>
          <DrawerFooter className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || answer.trim().length < MINIMUM_ANSWER_LENGTH || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Check-in
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Batal
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  // Render Dialog for desktop
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Check-in ke Booth</DialogTitle>
          <DialogDescription>
            Jawab pertanyaan berikut untuk check-in
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {questionContent}
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim() || answer.trim().length < MINIMUM_ANSWER_LENGTH || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Mengirim...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Check-in
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BoothCheckinDialog
