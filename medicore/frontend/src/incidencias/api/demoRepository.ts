import type { DemoState, UserRole } from '../../shared/types'

const STORAGE_KEY = 'medicore-demo-v1'
const initialState: DemoState = {
  activeRole: 'nursing',
  incidents: [
    { id: 'INC-2026-0141', kind: 'equipo-medico', title: 'Impresora de laboratorio sin conexión', description: 'No se reciben trabajos de impresión.', priority: 'Alta', status: 'Pendiente', area: 'Servicios Generales', location: 'Laboratorio', floor: 3, reportedBy: 'Carmen Vega', createdAt: '2026-10-14T10:13:00', symptom: 'Falla de energía' },
    { id: 'INC-2026-0140', kind: 'equipo-medico', title: 'Falla en el sistema de agua caliente', description: 'Las duchas de las habitaciones 203 y 206 tienen agua fría.', priority: 'Alta', status: 'Pendiente', area: 'Servicios Generales', location: 'Piso 3', floor: 3, reportedBy: 'Pedro Aliaga', createdAt: '2026-10-14T09:50:00', symptom: 'Falla de energía' },
    { id: 'INC-2026-0139', kind: 'equipo-medico', title: 'Sin red Wi-Fi en el área de Emergencias', description: 'La conexión no está disponible en el área.', priority: 'Media', status: 'Pendiente', area: 'Servicios Generales', location: 'Emergencias', floor: 1, reportedBy: 'Ana Torres', createdAt: '2026-10-14T09:30:00', symptom: 'Lecturas inestables' },
  ],
}

export function loadDemoState(): DemoState {
  try { const stored = localStorage.getItem(STORAGE_KEY); return stored ? JSON.parse(stored) as DemoState : initialState }
  catch { return initialState }
}
export function saveDemoState(state: DemoState) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }
export function setRole(state: DemoState, activeRole: UserRole): DemoState { return { ...state, activeRole } }
