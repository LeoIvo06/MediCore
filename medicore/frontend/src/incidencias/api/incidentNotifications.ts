export const incidentCreatedEvent = 'medicore:incident-created'
export const incidentNotificationsPath = '/notificaciones'

export interface IncidentNotification {
  incidentId: string
  title: string
  createdAt: string
  readAt: string | null
}

export function announceIncident<T>(incident: T): T {
  window.dispatchEvent(new Event(incidentCreatedEvent))
  return incident
}
