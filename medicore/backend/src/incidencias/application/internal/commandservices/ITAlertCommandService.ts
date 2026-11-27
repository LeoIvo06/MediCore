import type { DemoPrincipal } from '../../../../shared/domain/security/DemoPrincipal.js'
import { itAlertScope, missingStationData } from '../../../domain/model/aggregates/ITAlert.js'
import type { CreateITAlertCommand } from '../../../domain/model/commands/CreateITAlertCommand.js'
import type { ITAlertRepository } from '../../../domain/repositories/ITAlertRepository.js'
import { canConfirmAlert, canResolveIncident } from '../../../domain/services/IncidentAccessPolicy.js'
import type { ExternalOperationalReferencesService } from '../outboundservices/acl/ExternalOperationalReferencesService.js'

export class ITAlertCommandService {
  constructor(
    private readonly references: Pick<ExternalOperationalReferencesService, 'getStationConfiguration'>,
    private readonly alerts: ITAlertRepository,
  ) {}

  async resolve(number: number, actor: DemoPrincipal) {
    if (!canResolveIncident(actor, 'TI')) return { status: 'forbidden' as const }
    const incident = await this.alerts.resolve(number)
    return incident ? { status: 'found' as const, alert: incident } : { status: 'missing' as const }
  }

  async create({ stationId }: CreateITAlertCommand, actor: DemoPrincipal) {
    const station = stationId ? await this.references.getStationConfiguration(stationId) : null
    if (!station) return { status: 'invalid' as const, fields: ['stationId'] }
    const location = station.location?.trim()
    const ip = station.ip?.trim()
    if (!location || !ip) return { status: 'invalid' as const, fields: missingStationData(station) }

    const alert = await this.alerts.create({
      stationId: station.id,
      location,
      floor: station.floor,
      ip,
      reporterId: actor.id,
      reporterName: actor.name,
    })
    return { status: 'created' as const, alert }
  }

  async acknowledge(number: number, actor: DemoPrincipal) {
    if (!canConfirmAlert(actor, itAlertScope)) return { status: 'forbidden' as const }
    const alert = await this.alerts.acknowledge(number)
    return alert ? { status: 'found' as const, alert } : { status: 'missing' as const }
  }
}
