import { Button, Badge } from '@repo/react-components/ui'
import { cn } from '@repo/react-components/lib'
import type { PrizeTemplate } from 'src/types/schema'
import { OFFLINE_PRIZE_TEMPLATES, ONLINE_PRIZE_TEMPLATE } from 'src/lib/constants'

interface TemplateSelectorProps {
  selectedTemplate: PrizeTemplate | null
  onSelectTemplate: (template: PrizeTemplate) => void
  disabled?: boolean
}

export function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  disabled = false,
}: TemplateSelectorProps) {
  // Category badge colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grand':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'major':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'minor':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-4">
      {/* Offline Prizes Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
            Offline Prizes
          </Badge>
          <span className="text-xs text-muted-foreground">
            ({OFFLINE_PRIZE_TEMPLATES.length} prizes - draw individually)
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {OFFLINE_PRIZE_TEMPLATES.map(template => {
            const isSelected = selectedTemplate?.id === template.id

            return (
              <Button
                key={template.id}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => onSelectTemplate(template)}
                disabled={disabled}
                className={cn(
                  'h-auto py-2 px-3 justify-start text-left',
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-2 border-purple-500 shadow-lg'
                    : 'bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-300'
                )}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span
                    className={cn(
                      'text-sm font-semibold truncate flex-1',
                      isSelected ? 'text-white' : 'text-gray-900'
                    )}
                  >
                    {template.name}
                  </span>
                  <Badge
                    className={cn(
                      'text-xs shrink-0',
                      isSelected ? 'bg-white/20 text-white' : getCategoryColor(template.category)
                    )}
                  >
                    {template.category.toUpperCase()}
                  </Badge>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Online Prizes Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600">
            Online Prizes
          </Badge>
          <span className="text-xs text-muted-foreground">
            (5 winners - draw simultaneously)
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={selectedTemplate?.id === ONLINE_PRIZE_TEMPLATE.id ? 'default' : 'outline'}
            onClick={() => onSelectTemplate(ONLINE_PRIZE_TEMPLATE)}
            disabled={disabled}
            className={cn(
              'h-auto py-2 px-3 justify-start text-left',
              selectedTemplate?.id === ONLINE_PRIZE_TEMPLATE.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-2 border-cyan-500 shadow-lg'
                : 'bg-white hover:bg-cyan-50 border border-cyan-200 hover:border-cyan-300'
            )}
          >
            <div className="flex items-center justify-between w-full gap-2">
              <span
                className={cn(
                  'text-sm font-semibold',
                  selectedTemplate?.id === ONLINE_PRIZE_TEMPLATE.id ? 'text-white' : 'text-gray-900'
                )}
              >
                {ONLINE_PRIZE_TEMPLATE.name}
              </span>
              <Badge
                className={cn(
                  'text-xs shrink-0',
                  selectedTemplate?.id === ONLINE_PRIZE_TEMPLATE.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                )}
              >
                ALL 5 PRIZES
              </Badge>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
