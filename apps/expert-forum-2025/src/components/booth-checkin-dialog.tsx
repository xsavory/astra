import { useState, useEffect, useCallback, useMemo } from 'react'
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
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@repo/react-components/ui'
import { useIsMobile } from '@repo/react-components/hooks'
import type { Booth, BoothQuestion } from 'src/types/schema'
import api from 'src/lib/api'

interface BoothCheckinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booth: Booth
  onSubmit: (points: number, attempts: number) => Promise<void>
  isSubmitting: boolean
}

function BoothCheckinDialog({
  open,
  onOpenChange,
  booth,
  onSubmit,
  isSubmitting,
}: BoothCheckinDialogProps) {
  const isMobile = useIsMobile()

  // State management
  const [questionSequence, setQuestionSequence] = useState<number[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [attempts, setAttempts] = useState(1)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  // Initialize question sequence when dialog opens
  useEffect(() => {
    if (open && booth.questions.length > 0) {
      // Generate random starting position
      const randomStart = api.booths.getRandomQuestionIndex(booth)
      // Create sequence of 5 questions starting from random position
      const sequence = Array.from({ length: 5 }, (_, i) => (randomStart + i) % 5)
      setQuestionSequence(sequence)
      setCurrentQuestionIndex(0)
      setAttempts(1)
      setSelectedAnswer(null)
    }
  }, [open, booth])

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setQuestionSequence([])
      setCurrentQuestionIndex(0)
      setAttempts(1)
      setSelectedAnswer(null)
    }
  }, [open])

  // Get current question
  const currentQuestion: BoothQuestion | null = useMemo(() => {
    if (questionSequence.length === 0 || !booth.questions) return null
    const qIndex = questionSequence[currentQuestionIndex]
    if (qIndex === undefined) return null
    return booth.questions[qIndex] || null
  }, [booth, questionSequence, currentQuestionIndex])

  // Calculate current points (for display)
  const currentPoints = useMemo(() => {
    return api.booths.calculatePoints(attempts)
  }, [attempts])

  // Handle answer selection and validation
  const handleAnswerSubmit = useCallback(async () => {
    if (selectedAnswer === null || !currentQuestion) return

    // Validate answer
    const isCorrect = currentQuestion.correct_answer === selectedAnswer

    if (isCorrect) {
      // Correct answer! Submit check-in with points
      const points = api.booths.calculatePoints(attempts)
      await onSubmit(points, attempts)
      // Note: Parent component will close dialog and reset will happen via useEffect
    } else {
      // Wrong answer - move to next question
      const nextIndex = (currentQuestionIndex + 1) % 5
      setCurrentQuestionIndex(nextIndex)
      setAttempts((prev) => prev + 1)
      setSelectedAnswer(null) // Reset selection for next question
    }
  }, [selectedAnswer, currentQuestion, attempts, currentQuestionIndex, onSubmit])

  // Get attempt display text
  const attemptText = useMemo(() => {
    if (attempts <= 5) {
      return `Attempt ${attempts} of 5`
    }
    return `Attempt ${attempts}`
  }, [attempts])

  // Question content component
  const questionContent = currentQuestion ? (
    <div className="space-y-4">
      {/* Attempt Counter */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="text-sm font-medium text-muted-foreground">
          {attemptText}
        </div>
        <div className="text-sm font-semibold text-primary">
          Points: {currentPoints}
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="question" className='text-muted-foreground'>Question:</Label>
        <p className="text-sm leading-relaxed text-primary font-bold">
          {currentQuestion.question}
        </p>
      </div>

      {/* Answer Options (Radio Group) */}
      <div className="space-y-3">
        <Label className='font-bold text-muted-foreground'>Select Answer</Label>
        <RadioGroup
          value={selectedAnswer !== null ? String(selectedAnswer) : ''}
          onValueChange={(value) => setSelectedAnswer(Number(value))}
        >
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-accent/50 transition-colors"
            >
              <RadioGroupItem value={String(index)} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer font-normal"
              >
                <span className="font-semibold mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  ) : (
    <div className="py-8 text-center text-muted-foreground">
      Loading question...
    </div>
  )

  // Render Drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Check-in to Booth</DrawerTitle>
            <DrawerDescription>
              Answer the question correctly to check in
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
            {questionContent}
          </div>
          <DrawerFooter className="pt-4 border-t">
            <Button
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Answer
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" disabled={isSubmitting}>
                Cancel
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Check-in to Booth</DialogTitle>
          <DialogDescription>
            Answer the question correctly to check in
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {questionContent}
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BoothCheckinDialog
