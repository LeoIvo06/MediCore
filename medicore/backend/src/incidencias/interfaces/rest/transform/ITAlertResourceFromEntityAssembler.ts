import { itAlertScope, type ITAlert } from '../../../domain/model/aggregates/ITAlert.js'

export function toITAlertResource(alert: ITAlert) {
  return {
    id: `INC-TI-${String(alert.number).padStart(6, '0')}`,
    ...itAlertScope,
    title: `Alerta de sistema · ${alert.stationId}`,
    description: `Bloqueo reportado en ${alert.stationId}`,
    symptom: 'Estación bloqueada',
    incidentType: 'Bloqueo de estación',
    status: alert.acknowledgedAt ? 'Confirmada' : 'Nueva',
    open: true,
    location: alert.location,
    floor: alert.floor,
    reportedBy: alert.reporterName,
    createdAt: alert.createdAt.toISOString(),
    stationId: alert.stationId,
    ip: alert.ip ?? undefined,
    acknowledgedAt: alert.acknowledgedAt?.toISOString(),
  }
}
