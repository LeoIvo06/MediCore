import { Client } from 'pg'

export function createIncidentNotificationStream(connectionString: string) {
  return async (recipientId: string, signal: AbortSignal, ready: () => void, notify: () => void) => {
    const client = new Client({ connectionString, connectionTimeoutMillis: 2500 })
    let stop: () => void = () => {}
    const closed = new Promise<void>((resolve) => { stop = resolve })
    client.on('error', stop)
    client.on('notification', (event) => {
      if (event.payload === recipientId) notify()
    })
    signal.addEventListener('abort', stop, { once: true })
    try {
      await client.connect()
      await client.query('LISTEN medicore_incident_notifications')
      if (signal.aborted) return
      ready()
      await closed
    } finally {
      signal.removeEventListener('abort', stop)
      await client.end().catch(() => {})
    }
  }
}
