import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canConfirmAlert, canReadAcknowledgement, canReadIncident } from '../src/incidencias/domain/services/IncidentAccessPolicy.js'
import type { DemoPrincipal, DemoRole } from '../src/shared/domain/security/DemoPrincipal.js'

const actor = (id: string, role: DemoRole): DemoPrincipal => ({ id, role, name: id })
const alert = { area: 'TI', kind: 'alerta-ti', reporterId: 'admision' } as const

test('TI y el reportante consultan la alerta; TI confirma la recepción', () => {
  const admissions = actor('admision', 'admissions')
  const it = actor('soporte-ti', 'it-support')
  assert.equal(canReadIncident(admissions, alert), true)
  assert.equal(canReadIncident(it, alert), true)
  assert.equal(canReadAcknowledgement(admissions, alert), true)
  assert.equal(canReadAcknowledgement(it, alert), true)
  assert.equal(canConfirmAlert(admissions, alert), false)
  assert.equal(canConfirmAlert(it, alert), true)
  assert.equal(canConfirmAlert(it, { ...alert, kind: 'tecnico' }), false)
})

test('otro reportante y las áreas ajenas no acceden al detalle ni al acuse', () => {
  for (const outsider of [
    actor('otra-persona', 'admissions'),
    actor('servicios-generales', 'general-services'),
    actor('biomedica', 'biomedical'),
  ]) {
    assert.equal(canReadIncident(outsider, alert), false)
    assert.equal(canReadAcknowledgement(outsider, alert), false)
    assert.equal(canConfirmAlert(outsider, alert), false)
  }
})

test('Biomédica y Servicios Generales pueden consultar los incidentes de su área', () => {
  const equipment = { area: 'Biomédica', kind: 'equipo-medico', reporterId: 'enfermeria' } as const
  const facilities = { area: 'Servicios Generales', kind: 'tecnico', reporterId: 'otra-persona' } as const
  const nursing = actor('enfermeria', 'nursing')
  const biomedical = actor('biomedica', 'biomedical')
  const generalServices = actor('servicios-generales', 'general-services')
  assert.equal(canReadIncident(nursing, equipment), true)
  assert.equal(canReadIncident(biomedical, equipment), true)
  assert.equal(canReadIncident(generalServices, equipment), false)
  assert.equal(canReadIncident(generalServices, facilities), true)
  assert.equal(canReadIncident(actor('soporte-ti', 'it-support'), facilities), false)
})
