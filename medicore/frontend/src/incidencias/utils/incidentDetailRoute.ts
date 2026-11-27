import type { UserRole } from '../../shared/types'
import { equipmentIncidentsPath } from '../api/equipmentIncidents'
import { generalServicesIncidentsPath } from '../api/generalServicesIncidents'
import { itAlertsPath } from '../api/itAlerts'

const equipmentReport = { endpoint: equipmentIncidentsPath, roles: ['nursing', 'biomedical'] } satisfies IncidentDetailRoute
const itAlert = { endpoint: itAlertsPath, roles: ['admissions', 'it-support'] } satisfies IncidentDetailRoute
const generalServices = { endpoint: generalServicesIncidentsPath, roles: ['general-services'] } satisfies IncidentDetailRoute

interface IncidentDetailRoute {
  endpoint: string
  roles: readonly UserRole[]
}

export function getIncidentDetailRoute(id: string): IncidentDetailRoute | undefined {
  if (id.startsWith('INC-EQ-')) return equipmentReport
  if (id.startsWith('INC-TI-')) return itAlert
  if (/^INC-\d{4}-\d{4,10}$/.test(id)) return generalServices
}
