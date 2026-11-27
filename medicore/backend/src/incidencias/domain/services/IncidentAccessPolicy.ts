import type { DemoPrincipal, DemoRole } from '../../../shared/domain/security/DemoPrincipal.js'

type IncidentArea = 'TI' | 'Servicios Generales' | 'Biomédica'

interface IncidentAccessScope {
  area: IncidentArea
  kind: 'alerta-ti' | 'equipo-medico' | 'tecnico'
  reporterId: string
}

const areaRoles: Record<IncidentArea, DemoRole> = {
  TI: 'it-support',
  'Servicios Generales': 'general-services',
  Biomédica: 'biomedical',
}

export function canReadIncident(actor: DemoPrincipal, incident: IncidentAccessScope): boolean {
  return actor.role === areaRoles[incident.area] ||
    ((actor.role === 'nursing' || actor.role === 'admissions') && actor.id === incident.reporterId)
}

export function canConfirmAlert(actor: DemoPrincipal, incident: IncidentAccessScope): boolean {
  return actor.role === 'it-support' && incident.area === 'TI' && incident.kind === 'alerta-ti'
}

export function canReadAcknowledgement(actor: DemoPrincipal, incident: IncidentAccessScope): boolean {
  return canConfirmAlert(actor, incident) ||
    (incident.area === 'TI' && incident.kind === 'alerta-ti' &&
      actor.role === 'admissions' && actor.id === incident.reporterId)
}
