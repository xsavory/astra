import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@repo/react-components/provider'
import { AuthProvider } from 'src/contexts/auth'

import App from 'src/app'

import '@repo/react-components/style.css'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="expert-forum-2025-theme">
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>,
)