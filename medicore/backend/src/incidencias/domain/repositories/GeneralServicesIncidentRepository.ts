import type { GeneralServicesIncident } from '../model/aggregates/GeneralServicesIncident.js'

export interface GeneralServicesIncidentRepository {
  listActive(): Promise<GeneralServicesIncident[]>
  findById(id: string): Promise<GeneralServicesIncident | null>
}
