import type { ExternalOperationalReferencesService } from '../outboundservices/acl/ExternalOperationalReferencesService.js'

export class ReportOptionsQueryService {
  constructor(private readonly references: ExternalOperationalReferencesService) {}

  getReportOptions() {
    return this.references.getReportOptions()
  }
}
