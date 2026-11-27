import type { IncidentNotificationRepository } from '../../domain/repositories/IncidentNotificationRepository.js'

export class IncidentNotificationService {
  constructor(private readonly notifications: IncidentNotificationRepository) {}

  list(recipientId: string) {
    return this.notifications.list(recipientId, 50)
  }

  async markAllRead(recipientId: string, through: Date) {
    await this.notifications.markAllRead(recipientId, through, new Date())
    return this.list(recipientId)
  }

  markRead(recipientId: string, incidentId: string) {
    return this.notifications.markRead(recipientId, incidentId, new Date())
  }
}
