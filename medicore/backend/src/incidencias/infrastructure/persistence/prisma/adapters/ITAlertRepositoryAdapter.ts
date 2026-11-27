import type { PrismaClient } from '../../../../../shared/infrastructure/persistence/prisma/generated/client.js'
import type { ITAlertDraft } from '../../../../domain/model/aggregates/ITAlert.js'
import type { ITAlertRepository } from '../../../../domain/repositories/ITAlertRepository.js'

export class ITAlertRepositoryAdapter implements ITAlertRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(draft: ITAlertDraft) {
    return this.prisma.iTAlert.create({ data: draft })
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
