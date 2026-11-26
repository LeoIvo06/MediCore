import type { DemoState, Incident, UserRole } from '../../shared/types'
import { getEquipmentOptions, getLocations, getStations, getSymptoms } from '../../referencias-operativas/api/readContract'

const STORAGE_KEY = 'medicore-demo-v1'
const initialState: DemoState = {
  activeRole: 'nursing',
  incidents: [
    { id: 'INC-2026-0142', kind: 'alerta-ti', title: 'Caída de acceso al sistema clínico en Admisión', description: 'La pantalla de inicio no carga y el registro debe hacerse manualmente.', priority: 'Crítica', status: 'Nueva', area: 'TI', location: 'Admisión, Planta 1', floor: 1, reportedBy: 'Jorge Ramírez', createdAt: '2026-10-14T10:24:00', symptom: 'No carga la pantalla de inicio', stationId: 'ADM-01', ip: '10.20.1.41' },
    { id: 'INC-2026-0141', kind: 'equipo-medico', title: 'Impresora de laboratorio sin conexión', description: 'No se reciben trabajos de impresión.', priority: 'Alta', status: 'Pendiente', area: 'Servicios Generales', location: 'Laboratorio', floor: 3, reportedBy: 'Carmen Vega', createdAt: '2026-10-14T10:13:00', symptom: 'Falla de energía' },
    { id: 'INC-2026-0140', kind: 'equipo-medico', title: 'Falla en el sistema de agua caliente', description: 'Las duchas de las habitaciones 203 y 206 tienen agua fría.', priority: 'Alta', status: 'Pendiente', area: 'Servicios Generales', location: 'Piso 3', floor: 3, reportedBy: 'Pedro Aliaga', createdAt: '2026-10-14T09:50:00', symptom: 'Falla de energía' },
    { id: 'INC-2026-0139', kind: 'equipo-medico', title: 'Sin red Wi-Fi en el área de Emergencias', description: 'La conexión no está disponible en el área.', priority: 'Media', status: 'Pendiente', area: 'Servicios Generales', location: 'Emergencias', floor: 1, reportedBy: 'Ana Torres', createdAt: '2026-10-14T09:30:00', symptom: 'Lecturas inestables' },
    { id: 'INC-2026-0138', kind: 'equipo-medico', title: 'Ventilador mecánico VM-00123', description: 'No enciende y no responde al botón de inicio.', priority: 'Alta', status: 'Pendiente', area: 'Biomédica', location: 'UCI · Cama 5', floor: 3, reportedBy: 'Carmen Mendoza', createdAt: '2026-10-14T09:15:00', symptom: 'No enciende', equipmentId: 'eq-vent-00123' },
  ],
}

export function loadDemoState(): DemoState {
  try { const stored = localStorage.getItem(STORAGE_KEY); return stored ? JSON.parse(stored) as DemoState : initialState }
  catch { return initialState }
}
export function saveDemoState(state: DemoState) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }
function makeId(incidents: Incident[]) {
  const latest = incidents.reduce((max, item) => Math.max(max, Number(item.id.slice(-4)) || 0), 0)
  return `INC-2026-${String(latest + 1).padStart(4, '0')}`
}

export function createEquipmentIncident(state: DemoState, input: { equipmentId: string; locationId: string; symptom: string }) {
  const missing: string[] = []
  if (!input.equipmentId) missing.push('equipo')
  if (!input.locationId) missing.push('ubicación')
  if (!input.symptom) missing.push('síntoma')
  if (missing.length) return { state, missing }
  const selectedEquipment = getEquipmentOptions().find((item) => item.id === input.equipmentId)
  const selectedLocation = getLocations().find((item) => item.id === input.locationId)
  if (!selectedEquipment || !selectedLocation || !getSymptoms().includes(input.symptom)) return { state, missing: ['opciones válidas'] }
  const incident: Incident = {
    id: makeId(state.incidents), kind: 'equipo-medico', title: selectedEquipment.label,
    description: `${input.symptom} · ${selectedLocation.label}`, priority: 'Alta', status: 'Pendiente',
    area: 'Biomédica', location: selectedLocation.label, floor: selectedLocation.floor,
    reportedBy: 'Carmen Mendoza', createdAt: new Date().toISOString(), symptom: input.symptom, equipmentId: input.equipmentId,
  }
  return { state: { ...state, incidents: [incident, ...state.incidents] }, incident }
}

export function createITAlert(state: DemoState, stationId: string) {
  const station = getStations().find((item) => item.id === stationId)
  if (!station) return { state, missing: ['estación'] }
  const missing: string[] = []
  if (!station.location) missing.push('ubicación')
  if (!station.ip) missing.push('IP')
  if (missing.length) return { state, missing }
  const incident: Incident = {
    id: makeId(state.incidents), kind: 'alerta-ti', title: `Alerta de sistema · ${station.id}`,
    description: `Bloqueo reportado en ${station.id}`, priority: 'Crítica', status: 'Nueva',
    area: 'TI', location: station.location, floor: station.floor, reportedBy: 'Jorge Ramírez',
    createdAt: new Date().toISOString(), symptom: 'Estación bloqueada', stationId: station.id, ip: station.ip,
  }
  return { state: { ...state, incidents: [incident, ...state.incidents] }, incident }
}

export function acknowledgeAlert(state: DemoState, incidentId: string) {
  return { ...state, incidents: state.incidents.map((item) => item.id === incidentId && !item.acknowledgedAt
    ? { ...item, status: 'Confirmada' as const, acknowledgedAt: new Date().toISOString() } : item) }
}
export function setRole(state: DemoState, activeRole: UserRole): DemoState { return { ...state, activeRole } }
