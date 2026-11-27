import type { GeneralServicesIncidentRepository } from '../../../domain/repositories/GeneralServicesIncidentRepository.js'

export class GeneralServicesIncidentCommandService {
  constructor(private readonly incidents: GeneralServicesIncidentRepository) {}

  resolve(id: string) {
    return this.incidents.resolve(id)
  }
}
