import type { GeneralServicesIncident, GeneralServicesPriority } from '../../../domain/model/aggregates/GeneralServicesIncident.js'

const priorityLabels: Record<GeneralServicesPriority, string> = {
  Critical: 'Crítica', High: 'Alta', Medium: 'Media', Low: 'Baja',
}

export function toGeneralServicesIncidentResource(incident: GeneralServicesIncident) {
  return {
    id: incident.id,
    kind: 'tecnico',
    area: 'Servicios Generales',
    title: incident.title,
    incidentType: incident.incidentType,
    description: incident.description,
    symptom: incident.symptom,
    location: incident.location,
    floor: incident.floor,
    priority: priorityLabels[incident.priority],
    status: incident.closedAt ? 'Cerrada' : 'Pendiente',
    open: incident.closedAt === null,
    reportedBy: incident.reportedBy,
    createdAt: incident.createdAt.toISOString(),
  }
}
