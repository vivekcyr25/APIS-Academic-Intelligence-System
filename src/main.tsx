import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './global.css'
import { AuthProvider } from './contexts/AuthContext.tsx'

// Syncfusion License Registration — key loaded from .env (VITE_SYNCFUSION_LICENSE)
import { registerLicense } from '@syncfusion/ej2-base'
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE ?? '')

// Syncfusion CSS — only import what's actually on disk
// ej2-base covers base + progressbar + charts styling
import '@syncfusion/ej2-base/styles/material-dark.css'
import '@syncfusion/ej2-grids/styles/material-dark.css'
import '@syncfusion/ej2-react-grids/styles/material-dark.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AuthProvider>
  </StrictMode>,
)
