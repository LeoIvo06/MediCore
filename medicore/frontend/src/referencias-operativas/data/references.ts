import type { Equipment } from '../../shared/types'

export const locations = [
  { id: 'uci-3', label: 'UCI · Piso 3', floor: 3 },
  { id: 'emergencia-1', label: 'Emergencia · Piso 1', floor: 1 },
  { id: 'hospitalizacion-4', label: 'Hospitalización · Piso 4', floor: 4 },
  { id: 'consulta-2', label: 'Consulta Externa · Piso 2', floor: 2 },
]
export const symptoms = ['No enciende', 'Alarma constante', 'Lecturas inestables', 'Daño físico visible', 'Falla de energía']
export const equipmentOptions = [
  { id: 'eq-vent-00123', label: 'Ventilador mecánico VM-00123', locationId: 'uci-3' },
  { id: 'eq-monitor-04567', label: 'Monitor multiparámetro MM-04567', locationId: 'emergencia-1' },
  { id: 'eq-bomba-07890', label: 'Bomba de infusión BI-07890', locationId: 'hospitalizacion-4' },
  { id: 'eq-ecg-01145', label: 'Electrocardiógrafo ECG-01145', locationId: 'consulta-2' },
]
export const stations = [
  { id: 'ADM-01', label: 'ADM-01 · Admisión, Planta 1', location: 'Módulo de Admisión · Planta 1', floor: 1, ip: '10.20.1.41' },
  { id: 'ADM-02', label: 'ADM-02 · Admisión, Planta 1', location: 'Módulo de Admisión · Planta 1', floor: 1, ip: '' },
  { id: 'ADM-03', label: 'ADM-03 · Admisión, Planta 2', location: '', floor: 2, ip: '10.20.2.15' },
]
export const equipment: Equipment[] = [
  { id: 'eq-vent-00123', name: 'Ventilador mecánico VM-00123', category: 'Soporte respiratorio', location: 'UCI · Cama 5', assetCode: 'EQ-000456', brand: 'Dräger', model: 'Evita V500' },
  { id: 'eq-monitor-04567', name: 'Monitor multiparámetro MM-04567', category: 'Monitoreo', location: 'Emergencia · Box 3', assetCode: 'EQ-000457', brand: 'Philips', model: 'IntelliVue MX450' },
  { id: 'eq-bomba-07890', name: 'Bomba de infusión BI-07890', category: 'Infusión', location: 'Hospitalización · Piso 4', assetCode: 'EQ-000458', brand: 'B. Braun', model: 'Infusomat Space' },
  { id: 'eq-ecg-01145', name: 'Electrocardiógrafo ECG-01145', category: 'Diagnóstico', location: 'Consulta Externa · Consultorio 2', assetCode: 'EQ-000459', brand: 'GE Healthcare', model: 'MAC 2000' },
]
