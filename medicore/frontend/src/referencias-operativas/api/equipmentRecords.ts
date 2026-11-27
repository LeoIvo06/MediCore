import type { Equipment } from '../../shared/types'

export interface EquipmentRecord extends Equipment {
  maintenance: { id: string; date: string; type: string; details: string; technician: string; status: string }[]
}

export function equipmentRecordPath(id: string) {
  return `/referencias/equipos/${encodeURIComponent(id)}`
}
