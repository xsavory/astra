import { Link } from '@tanstack/react-router'
import { Button } from '@repo/react-components/ui'

import useToggle from 'src/hooks/use-toggle'
import logo from 'src/assets/logo.png'

import ThemeToggle from './theme-toggle'

export function Navbar() {
  const [isMenuOpen, toggleMenu] = useToggle(false)

  return (
    <nav className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">XSavory</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium dark:[&.active]:text-blue-300 [&.active]:text-blue-600 [&.active]:font-semibold"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium dark:[&.active]:text-blue-300 [&.active]:text-blue-600 [&.active]:font-semibold"
                >
                  About
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-2">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              Get Started
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium dark:[&.active]:text-blue-300 [&.active]:text-blue-600 [&.active]:font-semibold"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium dark:[&.active]:text-blue-300 [&.active]:text-blue-600 [&.active]:font-semibold"
                onClick={toggleMenu}
              >
                About
              </Link>
              <div className="pt-2 space-y-2">
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}