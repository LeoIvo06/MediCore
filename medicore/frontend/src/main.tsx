import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { IncidentProvider } from './incidencias/context/IncidentContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IncidentProvider><RouterProvider router={router} /></IncidentProvider>
  </StrictMode>,
)
