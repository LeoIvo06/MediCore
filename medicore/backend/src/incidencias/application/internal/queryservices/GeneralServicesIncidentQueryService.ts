import type { GeneralServicesIncidentRepository } from '../../../domain/repositories/GeneralServicesIncidentRepository.js'
import { groupActiveIncidentsByFloor } from '../../../domain/services/GeneralServicesInboxPolicy.js'

export class GeneralServicesIncidentQueryService {
  constructor(private readonly repository: GeneralServicesIncidentRepository) {}

  async listByFloor(includeResolved = false) {
    return groupActiveIncidentsByFloor(await this.repository.list(includeResolved), includeResolved)
  }

  find(id: string) {
    return this.repository.findById(id)
  }
}
