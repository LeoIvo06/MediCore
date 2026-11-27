import { itAlertId, itAlertScope, type ITAlert } from '../../../domain/model/aggregates/ITAlert.js'

export function toITAlertResource(alert: ITAlert) {
  return {
    id: itAlertId(alert.number),
    ...itAlertScope,
    title: `Alerta de sistema · ${alert.stationId}`,
    description: `Bloqueo reportado en ${alert.stationId}`,
    symptom: 'Estación bloqueada',
    incidentType: 'Bloqueo de estación',
    status: alert.resolvedAt ? 'Resuelto' : alert.acknowledgedAt ? 'Confirmada' : 'Nueva',
    open: alert.resolvedAt === null,
    resolvedAt: alert.resolvedAt?.toISOString(),
    location: alert.location,
    floor: alert.floor,
    reportedBy: alert.reporterName,
    createdAt: alert.createdAt.toISOString(),
    stationId: alert.stationId,
    ip: alert.ip ?? undefined,
    acknowledgedAt: alert.acknowledgedAt?.toISOString(),
    diagnosis: alert.diagnosedAt && alert.diagnosisSummary && alert.diagnosisResponded !== null && alert.diagnosedBy ? {
      summary: alert.diagnosisSummary,
      responded: alert.diagnosisResponded,
      author: alert.diagnosedBy,
      recordedAt: alert.diagnosedAt.toISOString(),
    } : undefined,
  }
}
