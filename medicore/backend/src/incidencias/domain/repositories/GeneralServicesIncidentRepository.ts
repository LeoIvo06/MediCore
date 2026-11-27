import type { GeneralServicesIncident } from '../model/aggregates/GeneralServicesIncident.js'

export interface GeneralServicesIncidentRepository {
  resolve(id: string): Promise<GeneralServicesIncident | null>
  list(includeResolved: boolean): Promise<GeneralServicesIncident[]>
  findById(id: string): Promise<GeneralServicesIncident | null>
}
