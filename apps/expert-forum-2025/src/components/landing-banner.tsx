import { Button } from '@repo/react-components/ui'

import logo from 'src/assets/logo.png'

export function LandingBanner() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <img src={logo} alt="SavoryLab Logo" className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            XSavoryLab React Template
          </h1>
          <p className="text-lg mb-6 max-w-2xl mx-auto text-blue-100">
            Internal template for rapid React development with Vite, TypeScript, and Tailwind CSS 4.
          </p>
          <Button size="lg" variant="secondary">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  )
}