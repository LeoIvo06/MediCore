import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { GeneralServicesIncident } from '../src/incidencias/domain/model/aggregates/GeneralServicesIncident.js'
import { groupActiveIncidentsByFloor } from '../src/incidencias/domain/services/GeneralServicesInboxPolicy.js'

function incident(id: string, floor: number, priority: GeneralServicesIncident['priority'], hour: number): GeneralServicesIncident {
  return {
    id, floor, priority, createdAt: new Date(Date.UTC(2026, 9, 14, hour)), closedAt: null,
    title: 'Falla', incidentType: 'Instalaciones', description: 'Detalle',
    symptom: 'No funciona', location: 'Habitación 301', reportedBy: 'Ana',
  }
}

test('agrupa pisos y ordena por prioridad y antigüedad, excluyendo incidentes cerrados', () => {
  const items = [
    incident('alta-reciente', 3, 'High', 10),
    incident('media-antigua', 3, 'Medium', 8),
    incident('piso-1', 1, 'Low', 8),
    incident('alta-antigua', 3, 'High', 9),
    { ...incident('cerrado', 3, 'Critical', 7), closedAt: new Date(Date.UTC(2026, 9, 14, 8)) },
  ]
  const groups = groupActiveIncidentsByFloor(items)
  assert.deepEqual(groups.map(({ floor, incidents }) => [floor, incidents.map((item) => item.id)]), [
    [1, ['piso-1']], [3, ['alta-antigua', 'alta-reciente', 'media-antigua']],
  ])
  assert.equal(items[0].id, 'alta-reciente')
  assert.deepEqual(groupActiveIncidentsByFloor([]), [])
})
