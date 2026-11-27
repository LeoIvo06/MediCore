import type { PrismaClient } from '../../../../../shared/infrastructure/persistence/prisma/generated/client.js'
import type { GeneralServicesIncidentRepository } from '../../../../domain/repositories/GeneralServicesIncidentRepository.js'

export class GeneralServicesIncidentRepositoryAdapter implements GeneralServicesIncidentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async resolve(id: string) {
    const [, incident] = await this.prisma.$transaction([
      this.prisma.generalServicesIncident.updateMany({
        where: { id, closedAt: null }, data: { closedAt: new Date() },
      }),
      this.prisma.generalServicesIncident.findUnique({ where: { id } }),
    ])
    return incident
  }

  list(includeResolved: boolean) {
    return this.prisma.generalServicesIncident.findMany({ where: includeResolved ? undefined : { closedAt: null } })
  }

  findById(id: string) {
    return this.prisma.generalServicesIncident.findUnique({ where: { id } })
  }
}
