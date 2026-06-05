import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'
import './index.css'
import App from './App.jsx'

// Aplica o tema salvo antes de renderizar (evita flash)
useThemeStore.getState().init();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
