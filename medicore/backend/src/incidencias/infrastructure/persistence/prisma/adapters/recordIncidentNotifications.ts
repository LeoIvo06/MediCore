import type { Prisma } from '../../../../../shared/infrastructure/persistence/prisma/generated/client.js'
import type { DemoRole } from '../../../../../shared/domain/security/DemoPrincipal.js'
import { canReadIncident } from '../../../../domain/services/IncidentAccessPolicy.js'

export async function recordIncidentNotifications(
  transaction: Prisma.TransactionClient,
  scope: Parameters<typeof canReadIncident>[1],
  event: { incidentId: string; title: string; createdAt: Date },
) {
  const users = await transaction.demoUser.findMany({ select: { id: true, name: true, role: true } })
  const recipients = users.filter((user) => canReadIncident({ ...user, role: user.role as DemoRole }, scope))
  await transaction.incidentNotification.createMany({
    data: recipients.map(({ id }) => ({ recipientId: id, ...event })),
  })
}
