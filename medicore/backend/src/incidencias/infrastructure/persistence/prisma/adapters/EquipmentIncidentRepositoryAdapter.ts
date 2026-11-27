import type { PrismaClient } from '../../../../../shared/infrastructure/persistence/prisma/generated/client.js'
import type { EquipmentIncidentDraft } from '../../../../domain/model/aggregates/EquipmentIncident.js'
import type { EquipmentIncidentRepository } from '../../../../domain/repositories/EquipmentIncidentRepository.js'

export class EquipmentIncidentRepositoryAdapter implements EquipmentIncidentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(draft: EquipmentIncidentDraft) {
    return this.prisma.equipmentIncident.create({ data: draft })
  }

  findByNumber(number: number) {
    return this.prisma.equipmentIncident.findUnique({ where: { number } })
  }

  list() {
    return this.prisma.equipmentIncident.findMany({
      orderBy: [{ createdAt: 'desc' }, { number: 'desc' }],
    })
  }
}
