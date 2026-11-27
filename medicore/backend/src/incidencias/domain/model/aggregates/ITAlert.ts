export interface ITAlertDraft {
  stationId: string
  location: string
  floor: number
  ip: string | null
  reporterId: string
  reporterName: string
}

export interface ITAlert extends ITAlertDraft {
  number: number
  createdAt: Date
  acknowledgedAt: Date | null
}

export const itAlertScope = { kind: 'alerta-ti', area: 'TI', priority: 'Crítica' } as const

export function missingStationData(station: { location: string | null; ip: string | null }) {
  const missing = []
  if (!station.location?.trim()) missing.push('location')
  if (!station.ip?.trim()) missing.push('ip')
  return missing
}
