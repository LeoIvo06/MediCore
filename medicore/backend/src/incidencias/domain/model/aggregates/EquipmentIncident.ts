export type EquipmentIncidentDraft = Readonly<{
  equipmentId: string
  equipmentName: string
  locationId: string
  locationLabel: string
  floor: number
  symptomId: string
  symptomLabel: string
  reporterId: string
  reporterName: string
}>

export type EquipmentIncident = EquipmentIncidentDraft & Readonly<{
  number: number
  createdAt: Date
}>

export const equipmentIncidentScope = {
  area: 'Biomédica',
  kind: 'equipo-medico',
} as const
