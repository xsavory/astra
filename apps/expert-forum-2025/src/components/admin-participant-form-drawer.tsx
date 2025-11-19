/**
 * AdminParticipantFormDrawer Component
 *
 * Form drawer for creating and editing participants:
 * - Create mode: Add new participant (creates auth account + user record)
 * - Edit mode: Update existing participant details
 * - Form validation with React Hook Form + Zod
 * - Editable fields: name, email, participant_type, company, division
 * - Auto-generates password for new participants
 *
 * @see PRD.md Section 9.2.2 (Participant Management - Create/Update)
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  SheetFooter,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@repo/react-components/ui'
import { Copy, CheckCircle2 } from 'lucide-react'
import type { User, ParticipantType } from 'src/types/schema'
import { COMPANY_OPTIONS } from 'src/lib/constants'
import { generatePassword } from 'src/lib/utils'

// Form validation schema
const participantFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  participant_type: z.enum(['online', 'offline'], {
    message: 'Participant type is required',
  }),
  company: z.string().min(1, 'Company is required').max(100, 'Company name is too long'),
})

type ParticipantFormData = z.infer<typeof participantFormSchema>

interface AdminParticipantFormDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ParticipantFormData & { password?: string }) => Promise<void>
  user?: User | null // If provided, edit mode; otherwise create mode
  isSubmitting?: boolean
}

function AdminParticipantFormDrawer({
  open,
  onClose,
  onSubmit,
  user,
  isSubmitting = false,
}: AdminParticipantFormDrawerProps) {
  const isEditMode = !!user

  // State for generated password
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Initialize form with existing data for edit mode
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          participant_type: user.participant_type || 'offline',
          company: user.company || '',
        }
      : {
          name: '',
          email: '',
          participant_type: 'offline',
          company: '',
        },
  })

  const participantType = watch('participant_type')
  const company = watch('company')

  // Update form values when user prop changes (for edit mode)
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        participant_type: user.participant_type || 'offline',
        company: user.company || '',
      })
    } else {
      reset({
        name: '',
        email: '',
        participant_type: 'offline',
        company: '',
      })
    }
  }, [user, reset])

  // Handle form submission
  const onFormSubmit = async (data: ParticipantFormData) => {
    try {
      // Generate password only for create mode
      let password: string | undefined
      if (!isEditMode) {
        password = generatePassword(data.name)
        setGeneratedPassword(password)
      }

      // Submit form with password
      await onSubmit({ ...data, password })

      // Show success alert if password was generated
      if (password) {
        setShowSuccessAlert(true)
        setIsCopied(false)
      } else {
        // For edit mode, close immediately
        reset()
        onClose()
      }
    } catch (error) {
      // Error handled by parent component
      console.error('Form submission error:', error)
    }
  }

  // Handle copy password to clipboard
  const handleCopyPassword = async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy password:', error)
      }
    }
  }

  // Handle drawer close
  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      setShowSuccessAlert(false)
      setGeneratedPassword(null)
      setIsCopied(false)
      onClose()
    }
  }

  // Handle close success alert and drawer
  const handleCloseSuccess = () => {
    reset()
    setShowSuccessAlert(false)
    setGeneratedPassword(null)
    setIsCopied(false)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {isEditMode ? 'Edit Participant' : 'Add New Participant'}
              </SheetTitle>
              <SheetDescription>
                {isEditMode
                  ? 'Update participant information'
                  : 'Create a new participant account'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form id="participant-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 p-4 pt-0">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter participant name"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="participant@example.com"
              {...register('email')}
              disabled={isSubmitting || isEditMode} // Email cannot be changed in edit mode
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
            {isEditMode && (
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            )}
          </div>

          {/* Participant Type Field */}
          <div className="space-y-2">
            <Label htmlFor="participant_type">
              Participant Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={participantType}
              onValueChange={(value) =>
                setValue('participant_type', value as ParticipantType)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
            {errors.participant_type && (
              <p className="text-xs text-destructive">
                {errors.participant_type.message}
              </p>
            )}
          </div>

          {/* Company Field */}
          <div className="space-y-2">
            <Label htmlFor="company">Company <span className="text-destructive">*</span></Label>
            <Select
              value={company || ''}
              onValueChange={(value) => setValue('company', value)}
              disabled={isSubmitting || isEditMode}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_OPTIONS.map((companyOption) => (
                  <SelectItem key={companyOption} value={companyOption}>
                    {companyOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.company && (
              <p className="text-xs text-destructive">{errors.company.message}</p>
            )}
            {isEditMode && (
              <p className="text-xs text-muted-foreground">
                Company cannot be changed
              </p>
            )}
          </div>

          {/* Success Alert - Show after participant is created */}
          {showSuccessAlert && generatedPassword && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Participant Created Successfully!</AlertTitle>
              <AlertDescription className="space-y-3">
                <div>
                  <p className="text-sm text-green-800 mb-2">
                    The participant account has been created. Please save the password below:
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={generatedPassword}
                      readOnly
                      className="font-mono text-lg font-semibold bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyPassword}
                      className="shrink-0"
                    >
                      {isCopied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Password format: {'{FirstName}'}-{'{XXXX}'} (4 random uppercase letters)
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleCloseSuccess}
                  className="w-full"
                >
                  Close
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Password Note for Create Mode */}
          {!isEditMode && !showSuccessAlert && (
            <div className="rounded-md bg-muted p-4 text-xs">
              <p className="font-medium">Password Generation</p>
              <p className="text-muted-foreground mt-1">
                A password will be generated with format: {'{FirstName}'}-{'{XXXX}'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Example: John-ABCD, Maria-XYZW
              </p>
            </div>
          )}
        </form>

        {!showSuccessAlert && (
          <SheetFooter>
            {/* Form Actions */}
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="participant-form"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update Participant'
                    : 'Create Participant'}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default AdminParticipantFormDrawer