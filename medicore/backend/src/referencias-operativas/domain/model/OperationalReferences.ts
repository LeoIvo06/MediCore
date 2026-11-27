export interface OperationalLocation {
  id: string
  label: string
  floor: number
}

export interface EquipmentOption {
  id: string
  label: string
  locationId: string
}

export interface SymptomOption {
  id: string
  label: string
}

export interface StationConfiguration {
  id: string
  label: string
  location: string | null
  floor: number
  ip: string | null
}

export interface MaintenanceEntry {
  id: string
  date: string
  type: string
  details: string
  technician: string
  status: string
}

export interface EquipmentRecord {
  id: string
  name: string
  assetCode: string
  category: string
  brand: string
  model: string
  location: string
  maintenance: MaintenanceEntry[]
}
