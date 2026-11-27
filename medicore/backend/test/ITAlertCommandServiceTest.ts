import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ITAlertCommandService } from '../src/incidencias/application/internal/commandservices/ITAlertCommandService.js'
import type { ITAlertDraft } from '../src/incidencias/domain/model/aggregates/ITAlert.js'
import type { ITAlertRepository } from '../src/incidencias/domain/repositories/ITAlertRepository.js'

const reporter = { id: 'admision', name: 'Jorge Ramírez', role: 'admissions' } as const
const ti = { id: 'soporte-ti', name: 'Diego Salazar', role: 'it-support' } as const

function setup(station: { id: string; location: string | null; ip: string | null; floor: number } | null) {
  const writes: ITAlertDraft[] = []
  let confirmations = 0
  const repository: ITAlertRepository = {
    async resolve() { return null },
    async saveDiagnosis() { return null },
    async create(draft) {
      writes.push(draft)
      return { ...draft, number: 1, createdAt: new Date(0), acknowledgedAt: null, resolvedAt: null, diagnosisSummary: null, diagnosisResponded: null, diagnosedBy: null, diagnosedAt: null }
    },
    async findByNumber() { return null },
    async list() { return [] },
    async acknowledge() { confirmations++; return null },
  }
  const commands = new ITAlertCommandService({ async getStationConfiguration() { return station } }, repository)
  return { commands, writes, confirmations: () => confirmations }
}

test('la alerta rechaza cada configuración incompleta sin escribir', async () => {
  for (const [location, ip, fields] of [
    ['Planta 1', null, ['ip']], [null, '10.20.1.41', ['location']], [null, null, ['location', 'ip']],
  ] as const) {
    const { commands, writes } = setup({ id: 'ADM-01', floor: 1, location, ip })
    assert.deepEqual(await commands.create({ stationId: 'ADM-01' }, reporter), { status: 'invalid', fields })
    assert.equal(writes.length, 0)
  }
  const unknown = setup(null)
  assert.deepEqual(await unknown.commands.create({ stationId: 'ADM-99' }, reporter), {
    status: 'invalid', fields: ['stationId'],
  })
  assert.deepEqual(unknown.writes, [])
})

test('la alerta usa los datos de Referencias y solo TI puede registrar el acuse', async () => {
  const station = { id: 'ADM-01', floor: 1, location: 'Planta 1', ip: '10.20.1.41' }
  const { commands, writes, confirmations } = setup(station)
  assert.equal((await commands.create({ stationId: station.id }, reporter)).status, 'created')
  assert.deepEqual(writes, [{
    stationId: 'ADM-01', floor: 1, location: 'Planta 1', ip: '10.20.1.41',
    reporterId: 'admision', reporterName: 'Jorge Ramírez',
  }])
  assert.deepEqual(await commands.acknowledge(1, reporter), { status: 'forbidden' })
  assert.equal(confirmations(), 0)
  assert.deepEqual(await commands.acknowledge(1, ti), { status: 'missing' })
  assert.equal(confirmations(), 1)
})
