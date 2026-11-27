import { demoApi } from '../../shared/api/demoApi'
import type { Incident } from '../../shared/types'

export const itAlertsPath = '/alertas-ti'
export const supportAlertsPath = '/soporte-ti/alertas'

export function sendITAlert(stationId: string) {
  return demoApi<Incident>('admissions', itAlertsPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stationId }),
  })
}

export function acknowledgeITAlert(id: string) {
  return demoApi<Incident>('it-support', `${itAlertsPath}/${encodeURIComponent(id)}/acuse`, { method: 'PUT' })
}
