import type { OperationalReferencesQueryService } from '../../application/internal/queryservices/OperationalReferencesQueryService.js'

export interface ReportOptionsContract {
  locations: { id: string; label: string; floor: number }[]
  equipment: { id: string; label: string; locationId: string }[]
  symptoms: { id: string; label: string }[]
}

export interface StationContract {
  id: string
  location: string | null
  floor: number
  ip: string | null
}

export class OperationalReferencesContextFacade {
  constructor(private readonly queries: OperationalReferencesQueryService) {}

  getReportOptions(): Promise<ReportOptionsContract> {
    return this.queries.getReportOptions()
  }

  async getStationConfiguration(id: string): Promise<StationContract | null> {
    const station = await this.queries.getStation(id)
    if (!station) return null
    return { id: station.id, location: station.location, floor: station.floor, ip: station.ip }
  }
}
