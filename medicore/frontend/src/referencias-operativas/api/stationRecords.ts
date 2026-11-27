export interface StationRecord {
  id: string
  label: string
  location: string | null
  ip: string | null
  floor: number
}

export const stationRecordsPath = '/referencias/estaciones'
