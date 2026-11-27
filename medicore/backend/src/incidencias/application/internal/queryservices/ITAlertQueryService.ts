import type { DemoPrincipal } from '../../../../shared/domain/security/DemoPrincipal.js'
import { itAlertScope } from '../../../domain/model/aggregates/ITAlert.js'
import type { ITAlertRepository } from '../../../domain/repositories/ITAlertRepository.js'
import { canReadAcknowledgement, canReadIncident } from '../../../domain/services/IncidentAccessPolicy.js'

export class ITAlertQueryService {
  constructor(private readonly alerts: ITAlertRepository) {}

  listForSupport() {
    return this.alerts.list()
  }

  listForReporter(reporterId: string) {
    return this.alerts.list(reporterId)
  }

  async find(number: number, actor: DemoPrincipal) {
    const alert = await this.alerts.findByNumber(number)
    if (!alert) return { status: 'missing' as const }

    const scope = { ...itAlertScope, reporterId: alert.reporterId }
    if (!canReadIncident(actor, scope)) return { status: 'forbidden' as const }
    return {
      status: 'found' as const,
      alert: canReadAcknowledgement(actor, scope) ? alert : { ...alert, acknowledgedAt: null },
    }
  }
}
