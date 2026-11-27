import { announceIncident } from './incidentNotifications'
import { demoApi } from '../../shared/api/demoApi'
import type { Incident } from '../../shared/types'

export interface ReportOptions {
  locations: { id: string; label: string; floor: number }[]
  equipment: { id: string; label: string; locationId: string }[]
  symptoms: { id: string; label: string }[]
}

export const reportOptionsPath = '/incidencias/opciones-reporte'
export const equipmentIncidentsPath = '/incidencias/equipos'

export function registerEquipmentIncident(input: { equipmentId: string; locationId: string; symptomId: string }) {
  return demoApi<Incident>('nursing', equipmentIncidentsPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then(announceIncident)
}
