import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@repo/react-components/context'

import App from 'src/app'

import '@repo/react-components/style.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="savorylab-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)