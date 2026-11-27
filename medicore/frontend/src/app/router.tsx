import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import RouteNotFound from './RouteNotFound'
import { getIncidentDetailRoute } from '../incidencias/utils/incidentDetailRoute'
import AlertPage from '../incidencias/pages/AlertPage'
import HomePage from '../incidencias/pages/HomePage'
import InboxPage from '../incidencias/pages/InboxPage'
import IncidentDetailPage from '../incidencias/pages/IncidentDetailPage'
import ReportPage from '../incidencias/pages/ReportPage'
import EquipmentPage from '../referencias-operativas/pages/EquipmentPage'

export const router = createBrowserRouter([{
  path: '/', element: <AppLayout />, children: [
    { index: true, element: <HomePage /> },
    { path: 'demo', element: <HomePage /> },
    { path: 'reportar-falla', element: <ReportPage />, handle: { roles: ['nursing'] } },
    { path: 'alerta-ti', element: <AlertPage />, handle: { roles: ['admissions'] } },
    { path: 'bandeja', element: <InboxPage />, handle: { roles: ['general-services', 'it-support', 'biomedical'] } },
    { path: 'incidentes/:id', element: <IncidentDetailPage />, handle: { detailRoles: (id: string) => getIncidentDetailRoute(id)?.roles } },
    { path: 'equipos/:equipmentId', element: <EquipmentPage />, handle: { roles: ['biomedical'] } },
    { path: '*', element: <RouteNotFound />, handle: { title: 'Página no encontrada' } },
  ],
}])
