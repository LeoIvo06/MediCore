import type { GeneralServicesIncidentRepository } from '../../../domain/repositories/GeneralServicesIncidentRepository.js'
import { groupActiveIncidentsByFloor } from '../../../domain/services/GeneralServicesInboxPolicy.js'

export class GeneralServicesIncidentQueryService {
  constructor(private readonly repository: GeneralServicesIncidentRepository) {}

  async listByFloor() {
    return groupActiveIncidentsByFloor(await this.repository.listActive())
  }

  find(id: string) {
    return this.repository.findById(id)
  }
}
