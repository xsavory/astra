import { Send } from 'lucide-react'
import {
  Button,
  Label,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
} from '@repo/react-components/ui'
import { COMPANY_OPTIONS, MIN_GROUP_SIZE } from 'src/lib/constants'

interface GroupDetailIdeationFormProps {
  title: string
  description: string
  companyCase: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCompanyCaseChange: (value: string) => void
  onSubmit: () => void
  canSubmit: boolean
  isFormValid: boolean
  isSubmitting: boolean
  memberCount: number
  minimumTitleLength: number
  minimumDescriptionLength: number
}

function GroupDetailIdeationForm({
  title,
  description,
  companyCase,
  onTitleChange,
  onDescriptionChange,
  onCompanyCaseChange,
  onSubmit,
  canSubmit,
  isFormValid,
  isSubmitting,
  memberCount,
  minimumTitleLength,
  minimumDescriptionLength,
}: GroupDetailIdeationFormProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Submit Ideation</h4>

      {!canSubmit && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Group harus memiliki tepat {MIN_GROUP_SIZE} anggota untuk submit ideation.
              Saat ini: {memberCount} anggota.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Company Case Select */}
      <div className="space-y-2">
        <Label htmlFor="company-case">Company Case *</Label>
        <Select
          value={companyCase}
          onValueChange={onCompanyCaseChange}
          disabled={!canSubmit || isSubmitting}
        >
          <SelectTrigger id="company-case">
            <SelectValue placeholder="Pilih company case" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="title">Judul Ideation *</Label>
        <Input
          id="title"
          placeholder="Masukkan judul ideation..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={200}
          disabled={!canSubmit || isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Minimal {minimumTitleLength} karakter ({title.trim().length}/{minimumTitleLength})
        </p>
      </div>

      {/* Description Textarea */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi Ideation *</Label>
        <Textarea
          id="description"
          placeholder="Jelaskan ide Anda secara detail..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={6}
          className="resize-none"
          disabled={!canSubmit || isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Minimal {minimumDescriptionLength} karakter ({description.trim().length}/{minimumDescriptionLength})
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={!canSubmit || !isFormValid || isSubmitting}
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
    </div>
  )
}

export default GroupDetailIdeationForm
