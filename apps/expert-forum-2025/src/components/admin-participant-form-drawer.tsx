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
import { useEffect } from 'react'
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
} from '@repo/react-components/ui'
import type { User, ParticipantType } from 'src/types/schema'

// Form validation schema
const participantFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  participant_type: z.enum(['online', 'offline'], {
    message: 'Participant type is required',
  }),
  company: z.string().max(100, 'Company name is too long').optional(),
  division: z.string().max(100, 'Division name is too long').optional(),
})

type ParticipantFormData = z.infer<typeof participantFormSchema>

interface AdminParticipantFormDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ParticipantFormData) => Promise<void>
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
          division: user.division || '',
        }
      : {
          name: '',
          email: '',
          participant_type: 'offline',
          company: '',
          division: '',
        },
  })

  const participantType = watch('participant_type')

  // Update form values when user prop changes (for edit mode)
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        participant_type: user.participant_type || 'offline',
        company: user.company || '',
        division: user.division || '',
      })
    } else {
      reset({
        name: '',
        email: '',
        participant_type: 'offline',
        company: '',
        division: '',
      })
    }
  }, [user, reset])

  // Handle form submission
  const onFormSubmit = async (data: ParticipantFormData) => {
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      // Error handled by parent component
      console.error('Form submission error:', error)
    }
  }

  // Handle drawer close
  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
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
              <p className="text-sm text-destructive">{errors.name.message}</p>
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
              <p className="text-sm text-destructive">{errors.email.message}</p>
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
              <p className="text-sm text-destructive">
                {errors.participant_type.message}
              </p>
            )}
          </div>

          {/* Password Note for Create Mode */}
          {!isEditMode && (
            <div className="rounded-md bg-muted p-4 text-sm">
              <p className="font-medium">Password Generation</p>
              <p className="text-muted-foreground mt-1">
                A default password will be automatically generated for this
                participant. The password can be found in the environment
                configuration.
              </p>
            </div>
          )}
        </form>

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
      </SheetContent>
    </Sheet>
  )
}

export default AdminParticipantFormDrawer
