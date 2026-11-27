import type { OperationalReferencesRepository } from '../../../domain/repositories/OperationalReferencesRepository.js'

export class OperationalReferencesQueryService {
  constructor(private readonly repository: OperationalReferencesRepository) {}

  async getReportOptions() {
    const [locations, equipment, symptoms] = await Promise.all([
      this.repository.listLocations(),
      this.repository.listEquipment(),
      this.repository.listSymptoms(),
    ])
    return { locations, equipment, symptoms }
  }

  getStation(id: string) {
    return this.repository.findStation(id)
  }

  getEquipment(id: string) {
    return this.repository.findEquipment(id)
  }
}
