import { equipmentIncidentId, equipmentIncidentScope, type EquipmentIncident } from '../../../domain/model/aggregates/EquipmentIncident.js'

export function toEquipmentIncidentResource(incident: EquipmentIncident) {
  return {
    id: equipmentIncidentId(incident.number),
    ...equipmentIncidentScope,
    title: incident.equipmentName,
    description: `${incident.symptomLabel} · ${incident.locationLabel}`,
    priority: 'Alta',
    status: incident.resolvedAt ? 'Resuelto' : 'Pendiente',
    open: incident.resolvedAt === null,
    resolvedAt: incident.resolvedAt?.toISOString(),
    location: incident.locationLabel,
    floor: incident.floor,
    reportedBy: incident.reporterName,
    createdAt: incident.createdAt.toISOString(),
    symptom: incident.symptomLabel,
    equipmentId: incident.equipmentId,
  }
}
