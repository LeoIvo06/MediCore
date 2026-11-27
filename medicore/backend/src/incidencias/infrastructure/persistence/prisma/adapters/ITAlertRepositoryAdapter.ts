import type { PrismaClient } from '../../../../../shared/infrastructure/persistence/prisma/generated/client.js'
import { itAlertId, itAlertScope, type ITAlertDraft } from '../../../../domain/model/aggregates/ITAlert.js'
import type { ITAlertDiagnosis, ITAlertRepository } from '../../../../domain/repositories/ITAlertRepository.js'

import { recordIncidentNotifications } from './recordIncidentNotifications.js'

export class ITAlertRepositoryAdapter implements ITAlertRepository {
  constructor(private readonly prisma: PrismaClient) {}

  saveDiagnosis(number: number, data: ITAlertDiagnosis) {
    return this.prisma.$transaction(async (transaction) => {
      const { count } = await transaction.iTAlert.updateMany({
        where: { number, resolvedAt: null, stationId: { not: '' } },
        data,
      })
      return count ? transaction.iTAlert.findUnique({ where: { number } }) : null
    })
  }

  async resolve(number: number) {
    const [, incident] = await this.prisma.$transaction([
      this.prisma.iTAlert.updateMany({
        where: { number, resolvedAt: null }, data: { resolvedAt: new Date() },
      }),
      this.prisma.iTAlert.findUnique({ where: { number } }),
    ])
    return incident
  }

  create(draft: ITAlertDraft) {
    return this.prisma.$transaction(async (transaction) => {
      const incident = await transaction.iTAlert.create({ data: draft })
      await recordIncidentNotifications(transaction, { ...itAlertScope, reporterId: incident.reporterId }, {
        incidentId: itAlertId(incident.number), title: `Alerta de TI · ${incident.stationId}`, createdAt: incident.createdAt,
      })
      return incident
    })
  }

  findByNumber(number: number) {
    return this.prisma.iTAlert.findUnique({ where: { number } })
  }

  list(reporterId?: string) {
    return this.prisma.iTAlert.findMany({
      where: { reporterId },
      orderBy: [{ createdAt: 'desc' }, { number: 'desc' }],
    })
  }

  async acknowledge(number: number) {
    const [, alert] = await this.prisma.$transaction([
      this.prisma.iTAlert.updateMany({
        where: { number, acknowledgedAt: null },
        data: { acknowledgedAt: new Date() },
      }),
      this.prisma.iTAlert.findUnique({ where: { number } }),
    ])
    return alert
  }
}
