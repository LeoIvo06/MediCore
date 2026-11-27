import type { IncidentNotificationRepository } from '../../domain/repositories/IncidentNotificationRepository.js'

export class IncidentNotificationService {
  constructor(private readonly notifications: IncidentNotificationRepository) {}

  list(recipientId: string) {
    return this.notifications.list(recipientId, 50)
  }

  markRead(recipientId: string, incidentId: string) {
    return this.notifications.markRead(recipientId, incidentId, new Date())
  }
}
