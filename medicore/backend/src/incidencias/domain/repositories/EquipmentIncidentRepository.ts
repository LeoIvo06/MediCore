import type { EquipmentIncident, EquipmentIncidentDraft } from '../model/aggregates/EquipmentIncident.js'

export interface EquipmentIncidentRepository {
  resolve(number: number): Promise<EquipmentIncident | null>
  create(draft: EquipmentIncidentDraft): Promise<EquipmentIncident>
  findByNumber(number: number): Promise<EquipmentIncident | null>
  list(): Promise<EquipmentIncident[]>
}
