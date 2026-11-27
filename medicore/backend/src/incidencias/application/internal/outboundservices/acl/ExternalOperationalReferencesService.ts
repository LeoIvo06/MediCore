import type { OperationalReferencesContextFacade } from '../../../../../referencias-operativas/interfaces/acl/OperationalReferencesContextFacade.js'

export class ExternalOperationalReferencesService {
  constructor(private readonly references: OperationalReferencesContextFacade) {}

  getReportOptions() {
    return this.references.getReportOptions()
  }

  getStationConfiguration(stationId: string) {
    return this.references.getStationConfiguration(stationId)
  }
}
