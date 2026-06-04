import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClickToCopySource } from './dev/ClickToCopySource.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      {import.meta.env.DEV && <ClickToCopySource />}
    </BrowserRouter>
  </StrictMode>,
)
