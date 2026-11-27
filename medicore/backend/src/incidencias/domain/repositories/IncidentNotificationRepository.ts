export interface IncidentNotification {
  incidentId: string
  title: string
  createdAt: Date
  readAt: Date | null
}

export interface IncidentNotificationRepository {
  list(recipientId: string, limit: number): Promise<IncidentNotification[]>
  markAllRead(recipientId: string, through: Date, readAt: Date): Promise<void>
  markRead(recipientId: string, incidentId: string, readAt: Date): Promise<boolean>
}
