import type {
  EquipmentOption, EquipmentRecord, OperationalLocation, StationConfiguration, SymptomOption,
} from '../model/OperationalReferences.js'

export interface OperationalReferencesRepository {
  listLocations(): Promise<OperationalLocation[]>
  listEquipment(): Promise<EquipmentOption[]>
  listSymptoms(): Promise<SymptomOption[]>
  listStations(): Promise<StationConfiguration[]>
  findStation(id: string): Promise<StationConfiguration | null>
  findEquipment(id: string): Promise<EquipmentRecord | null>
}
