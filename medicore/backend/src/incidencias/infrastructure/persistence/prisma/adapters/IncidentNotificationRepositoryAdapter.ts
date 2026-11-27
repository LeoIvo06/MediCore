import type { PrismaClient } from '../../../../../shared/infrastructure/persistence/prisma/generated/client.js'
import type { IncidentNotificationRepository } from '../../../../domain/repositories/IncidentNotificationRepository.js'

export class IncidentNotificationRepositoryAdapter implements IncidentNotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  list(recipientId: string, limit: number) {
    return this.prisma.incidentNotification.findMany({
      where: { recipientId },
      select: { incidentId: true, title: true, createdAt: true, readAt: true },
      orderBy: [{ readAt: { sort: 'desc', nulls: 'first' } }, { createdAt: 'desc' }, { incidentId: 'desc' }],
      take: limit,
    })
  }

  async markRead(recipientId: string, incidentId: string, readAt: Date) {
    const updated = await this.prisma.incidentNotification.updateMany({
      where: { recipientId, incidentId, readAt: null },
      data: { readAt },
    })
    if (updated.count) return true
    const existing = await this.prisma.incidentNotification.findUnique({
      where: { recipientId_incidentId: { recipientId, incidentId } },
      select: { incidentId: true },
    })
    return existing !== null
  }
}
