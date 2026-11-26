import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AlertPage from '../incidencias/pages/AlertPage'
import HomePage from '../incidencias/pages/HomePage'
import InboxPage from '../incidencias/pages/InboxPage'
import IncidentDetailPage from '../incidencias/pages/IncidentDetailPage'
import ReportPage from '../incidencias/pages/ReportPage'
import EquipmentPage from '../referencias-operativas/pages/EquipmentPage'

export const router = createBrowserRouter([{
  path: '/', element: <AppLayout />, children: [
    { index: true, element: <HomePage /> },
    { path: 'reportar-falla', element: <ReportPage /> },
    { path: 'alerta-ti', element: <AlertPage /> },
    { path: 'bandeja', element: <InboxPage /> },
    { path: 'incidentes/:id', element: <IncidentDetailPage /> },
    { path: 'equipos/:equipmentId', element: <EquipmentPage /> },
  ],
}])
