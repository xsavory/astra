import { useState, useEffect, useCallback } from 'react'
import { Send, Lightbulb } from 'lucide-react'

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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import { COMPANY_OPTIONS } from 'src/lib/constants'

interface IdeationOnlineSubmissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { title: string; description: string; company_case: string }) => Promise<void>
  isSubmitting: boolean
  existingCompanyCases?: string[] // Company cases already submitted by user
}

const MINIMUM_TITLE_LENGTH = 10
const MINIMUM_DESCRIPTION_LENGTH = 50

function IdeationOnlineSubmissionDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  existingCompanyCases = [],
}: IdeationOnlineSubmissionDialogProps) {
  const isMobile = useIsMobile()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [companyCase, setCompanyCase] = useState('')

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle('')
      setDescription('')
      setCompanyCase('')
    }
  }, [open])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      company_case: companyCase,
    })
  }, [title, description, companyCase, onSubmit])

  // Check if form is valid
  const isFormValid =
    title.trim().length >= MINIMUM_TITLE_LENGTH &&
    description.trim().length >= MINIMUM_DESCRIPTION_LENGTH &&
    companyCase.length > 0

  // Filter available company cases (exclude already submitted ones)
  const availableCompanyCases = COMPANY_OPTIONS.filter(
    (option) => !existingCompanyCases.includes(option)
  )

  const formContent = (
    <div className="space-y-4">
      {/* Company Case Select */}
      <div className="space-y-2">
        <Label htmlFor="company-case">Company Case *</Label>
        <Select value={companyCase} onValueChange={setCompanyCase}>
          <SelectTrigger id="company-case">
            <SelectValue placeholder="Pilih company case" />
          </SelectTrigger>
          <SelectContent>
            {availableCompanyCases.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Semua company case sudah disubmit
              </div>
            ) : (
              availableCompanyCases.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {existingCompanyCases.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Anda sudah submit: {existingCompanyCases.join(', ')}
          </p>
        )}
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="title">Judul Ideation *</Label>
        <Input
          id="title"
          placeholder="Masukkan judul ideation Anda..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">
          Minimal {MINIMUM_TITLE_LENGTH} karakter ({title.trim().length}/{MINIMUM_TITLE_LENGTH})
        </p>
      </div>

      {/* Description Textarea */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi Ideation *</Label>
        <Textarea
          id="description"
          placeholder="Jelaskan ide Anda secara detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Minimal {MINIMUM_DESCRIPTION_LENGTH} karakter ({description.trim().length}/{MINIMUM_DESCRIPTION_LENGTH})
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
            <DrawerTitle className="flex items-center gap-2">
              <Lightbulb className="size-5" />
              Submit Ideation Baru
            </DrawerTitle>
            <DrawerDescription>
              Sampaikan ide inovasi atau improvement Anda
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[60vh]">
            {formContent}
          </div>
          <DrawerFooter className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting || availableCompanyCases.length === 0}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ideation
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" disabled={isSubmitting}>
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
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="size-5" />
            Submit Ideation Baru
          </DialogTitle>
          <DialogDescription>
            Sampaikan ide inovasi atau improvement Anda
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {formContent}
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || availableCompanyCases.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Ideation
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default IdeationOnlineSubmissionDialog
