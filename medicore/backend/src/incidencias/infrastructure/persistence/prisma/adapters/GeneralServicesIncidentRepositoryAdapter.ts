import type { PrismaClient } from '../../../../../shared/infrastructure/persistence/prisma/generated/client.js'
import type { GeneralServicesIncidentRepository } from '../../../../domain/repositories/GeneralServicesIncidentRepository.js'

export class GeneralServicesIncidentRepositoryAdapter implements GeneralServicesIncidentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listActive() {
    return this.prisma.generalServicesIncident.findMany({ where: { closedAt: null } })
  }

  findById(id: string) {
    return this.prisma.generalServicesIncident.findUnique({ where: { id } })
  }
}
