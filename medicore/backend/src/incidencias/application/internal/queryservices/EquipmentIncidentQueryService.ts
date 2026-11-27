import type { DemoPrincipal } from '../../../../shared/domain/security/DemoPrincipal.js'
import { equipmentIncidentScope } from '../../../domain/model/aggregates/EquipmentIncident.js'
import type { EquipmentIncidentRepository } from '../../../domain/repositories/EquipmentIncidentRepository.js'
import { canReadIncident } from '../../../domain/services/IncidentAccessPolicy.js'

export class EquipmentIncidentQueryService {
  constructor(private readonly incidents: EquipmentIncidentRepository) {}

  listBiomedical() {
    return this.incidents.list()
  }

  async find(number: number, actor: DemoPrincipal) {
    const incident = await this.incidents.findByNumber(number)
    if (!incident) return { status: 'missing' as const }
    if (!canReadIncident(actor, { ...equipmentIncidentScope, reporterId: incident.reporterId })) {
      return { status: 'forbidden' as const }
    }
    return { status: 'found' as const, incident }
  }
}
