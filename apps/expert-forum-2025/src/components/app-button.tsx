import * as React from 'react'
import { Button } from '@repo/react-components/ui'
import { cn } from '@repo/react-components/lib'

export interface AppButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'default' | 'outline' | 'ghost' | 'link'
}

const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles =
      variant === 'default'
        ? 'bg-gradient-to-r from-primary via-blue-600 to-cyan-500 hover:from-primary/90 hover:via-blue-600/90 hover:to-cyan-500/90 border-2 border-white/30 shadow-xl shadow-primary/30 text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50'
        : ''

    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(baseStyles, className)}
        {...props}
      />
    )
  }
)

AppButton.displayName = 'AppButton'

export default AppButton
