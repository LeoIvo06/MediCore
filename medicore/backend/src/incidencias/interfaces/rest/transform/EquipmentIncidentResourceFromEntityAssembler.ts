import { equipmentIncidentScope, type EquipmentIncident } from '../../../domain/model/aggregates/EquipmentIncident.js'

export function toEquipmentIncidentResource(incident: EquipmentIncident) {
  return {
    id: `INC-EQ-${String(incident.number).padStart(6, '0')}`,
    ...equipmentIncidentScope,
    title: incident.equipmentName,
    description: `${incident.symptomLabel} · ${incident.locationLabel}`,
    priority: 'Alta',
    status: 'Pendiente',
    location: incident.locationLabel,
    floor: incident.floor,
    reportedBy: incident.reporterName,
    createdAt: incident.createdAt.toISOString(),
    symptom: incident.symptomLabel,
    equipmentId: incident.equipmentId,
  }
}
