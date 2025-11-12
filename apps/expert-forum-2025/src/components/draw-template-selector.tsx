import { Button } from '@repo/react-components/ui'
import { cn } from '@repo/react-components/lib'
import type { PrizeTemplate } from 'src/types/schema'

interface TemplateSelectorProps {
  templates: PrizeTemplate[]
  selectedTemplate: PrizeTemplate
  onSelectTemplate: (template: PrizeTemplate) => void
  disabled?: boolean
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
  disabled = false,
}: TemplateSelectorProps) {
  return (
    <div className="flex justify-center items-center gap-3 flex-wrap">
      {templates.map(template => {
        const isSelected = selectedTemplate.id === template.id

        return (
          <Button
            key={template.id}
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onSelectTemplate(template)}
            disabled={disabled}
            className={cn(
              'h-auto px-4 items-center min-w-[120px]',
              isSelected
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-2 border-cyan-500 shadow-lg'
                : 'bg-white/80 backdrop-blur border-2 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300'
            )}
          >
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'text-sm font-bold',
                  isSelected ? 'text-white' : 'text-gray-900'
                )}
              >
                {template.name}
              </span>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
