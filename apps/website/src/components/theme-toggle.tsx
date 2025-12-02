import { Moon, Sun, Laptop2 } from 'lucide-react'
import { Button } from '@repo/react-components/ui'
import { useTheme } from '@repo/react-components/provider'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getThemeIcon = () => {
    if (theme === 'light') {
      return (
        <Sun className="h-4 w-4" />
      )
    } else if (theme === 'dark') {
      return (
        <Moon className="h-4 w-4" />
      )
    } else {
      return (
        <Laptop2 className="h-4 w-4" />
      )
    }
  }

  const getThemeLabel = () => {
    if (theme === 'light') return 'Light'
    if (theme === 'dark') return 'Dark'
    return 'System'
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
      title={`Current: ${getThemeLabel()}`}
    >
      {getThemeIcon()}
    </Button>
  )
}

export default ThemeToggle