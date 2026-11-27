import type { PrismaClient } from '../../../../../shared/infrastructure/persistence/prisma/generated/client.js'
import type { EquipmentRecord } from '../../../../domain/model/OperationalReferences.js'
import type { OperationalReferencesRepository } from '../../../../domain/repositories/OperationalReferencesRepository.js'

export class OperationalReferencesRepositoryAdapter implements OperationalReferencesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listLocations() {
    return this.prisma.operationalLocation.findMany({
      select: { id: true, label: true, floor: true },
      orderBy: [{ floor: 'asc' }, { label: 'asc' }, { id: 'asc' }],
    })
  }

  async listEquipment() {
    const equipment = await this.prisma.operationalEquipment.findMany({
      select: { id: true, name: true, locationId: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    })
    return equipment.map(({ id, name, locationId }) => ({ id, label: name, locationId }))
  }

  listSymptoms() {
    return this.prisma.operationalSymptom.findMany({
      select: { id: true, label: true },
      orderBy: { id: 'asc' },
    })
  }

  findStation(id: string) {
    return this.prisma.operationalStation.findUnique({
      where: { id },
      select: { id: true, label: true, location: true, floor: true, ip: true },
    })
  }

  async findEquipment(id: string): Promise<EquipmentRecord | null> {
    const equipment = await this.prisma.operationalEquipment.findUnique({
      where: { id },
      select: {
        id: true, name: true, assetCode: true, category: true, brand: true, model: true, location: true,
        maintenance: {
          select: { id: true, date: true, type: true, details: true, technician: true, status: true },
          orderBy: [{ date: 'desc' }, { id: 'asc' }],
        },
      },
    })
    if (!equipment) return null
    const { maintenance, ...fields } = equipment
    return { ...fields, maintenance: maintenance.map(({ date, ...entry }) => ({
      ...entry, date: date.toISOString().slice(0, 10),
    })) }
  }
}
