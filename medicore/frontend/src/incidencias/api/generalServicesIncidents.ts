import type { Incident } from '../../shared/types'

export interface GeneralServicesFloorGroup {
  floor: number
  incidents: Incident[]
}

export const generalServicesIncidentsPath = '/servicios-generales/incidencias'
