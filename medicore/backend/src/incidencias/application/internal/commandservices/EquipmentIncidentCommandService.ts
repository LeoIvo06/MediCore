import type { DemoPrincipal } from '../../../../shared/domain/security/DemoPrincipal.js'
import type { CreateEquipmentIncidentCommand } from '../../../domain/model/commands/CreateEquipmentIncidentCommand.js'
import type { EquipmentIncidentRepository } from '../../../domain/repositories/EquipmentIncidentRepository.js'
import type { ExternalOperationalReferencesService } from '../outboundservices/acl/ExternalOperationalReferencesService.js'

import { canResolveIncident } from '../../../domain/services/IncidentAccessPolicy.js'

type Field = keyof CreateEquipmentIncidentCommand

export class EquipmentIncidentCommandService {
  constructor(
    private readonly references: ExternalOperationalReferencesService,
    private readonly incidents: EquipmentIncidentRepository,
  ) {}

  async resolve(number: number, actor: DemoPrincipal) {
    if (!canResolveIncident(actor, 'Biomédica')) return { status: 'forbidden' as const }
    const incident = await this.incidents.resolve(number)
    return incident ? { status: 'found' as const, incident } : { status: 'missing' as const }
  }

  async create(command: CreateEquipmentIncidentCommand, reporter: DemoPrincipal) {
    const missing = (['equipmentId', 'locationId', 'symptomId'] as const).filter((field) => !command[field])
    if (missing.length) return { status: 'invalid' as const, fields: missing }

    const options = await this.references.getReportOptions()
    const equipment = options.equipment.find((item) => item.id === command.equipmentId)
    const location = options.locations.find((item) => item.id === command.locationId)
    const symptom = options.symptoms.find((item) => item.id === command.symptomId)
    if (!equipment || !location || !symptom) {
      const fields: Field[] = []
      if (!equipment) fields.push('equipmentId')
      if (!location) fields.push('locationId')
      if (!symptom) fields.push('symptomId')
      return { status: 'invalid' as const, fields }
    }

    const incident = await this.incidents.create({
      equipmentId: equipment.id,
      equipmentName: equipment.label,
      locationId: location.id,
      locationLabel: location.label,
      floor: location.floor,
      symptomId: symptom.id,
      symptomLabel: symptom.label,
      reporterId: reporter.id,
      reporterName: reporter.name,
    })
    return { status: 'created' as const, incident }
  }
}
