import { demoEventStream } from '../../shared/api/demoApi'
import type { UserRole } from '../../shared/types'

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

export async function listenForNotifications(role: UserRole, signal: AbortSignal, onChange: () => void) {
  const response = await demoEventStream(role, incidentNotificationsPath + '/eventos', signal)
  if (!response.body || !response.headers.get('content-type')?.startsWith('text/event-stream')) return
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  try {
    let pending = ''
    while (!signal.aborted) {
      const { done, value } = await reader.read()
      if (done) break
      const lines = (pending + value).split('\n')
      pending = lines.pop() ?? ''
      for (const line of lines) {
        if (line === 'data: ready' || line === 'data: update') onChange()
      }
    }
  } finally {
    reader.releaseLock()
  }
}
