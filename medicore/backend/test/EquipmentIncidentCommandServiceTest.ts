import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EquipmentIncidentCommandService } from '../src/incidencias/application/internal/commandservices/EquipmentIncidentCommandService.js'
import { ExternalOperationalReferencesService } from '../src/incidencias/application/internal/outboundservices/acl/ExternalOperationalReferencesService.js'
import type { EquipmentIncidentDraft } from '../src/incidencias/domain/model/aggregates/EquipmentIncident.js'
import type { EquipmentIncidentRepository } from '../src/incidencias/domain/repositories/EquipmentIncidentRepository.js'
import { OperationalReferencesQueryService } from '../src/referencias-operativas/application/internal/queryservices/OperationalReferencesQueryService.js'
import { OperationalReferencesContextFacade } from '../src/referencias-operativas/interfaces/acl/OperationalReferencesContextFacade.js'

function setup() {
  const writes: EquipmentIncidentDraft[] = []
  const repository: EquipmentIncidentRepository = {
    async create(draft) {
      writes.push(draft)
      return { ...draft, number: 1, createdAt: new Date('2026-11-26T00:00:00Z') }
    },
    async findByNumber() { return null },
    async list() { return [] },
  }
  const queries = new OperationalReferencesQueryService({
    async listEquipment() { return [{ id: 'vent', label: 'Ventilador', locationId: 'uci' }] },
    async listLocations() { return [{ id: 'uci', label: 'UCI', floor: 3 }] },
    async listSymptoms() { return [{ id: 'no-enciende', label: 'No enciende' }] },
    async findStation() { return null },
    async findEquipment() { return null },
  })
  const references = new ExternalOperationalReferencesService(new OperationalReferencesContextFacade(queries))
  return { commands: new EquipmentIncidentCommandService(references, repository), writes }
}

const reporter = { id: 'enfermeria', name: 'Carmen Mendoza', role: 'nursing' } as const
const valid = { equipmentId: 'vent', locationId: 'uci', symptomId: 'no-enciende' }

test('el reporte incompleto o con referencias inexistentes no escribe en el repositorio', async () => {
  const { commands, writes } = setup()
  assert.deepEqual(await commands.create({ ...valid, symptomId: '' }, reporter), {
    status: 'invalid', fields: ['symptomId'],
  })
  assert.deepEqual(await commands.create({ ...valid, equipmentId: 'inexistente', locationId: 'inexistente' }, reporter), {
    status: 'invalid', fields: ['equipmentId', 'locationId'],
  })
  assert.equal(writes.length, 0)
})

test('el reporte guarda las referencias y el reportante autenticado', async () => {
  const { commands, writes } = setup()
  const result = await commands.create(valid, reporter)
  assert.equal(result.status, 'created')
  assert.deepEqual(writes, [{
    ...valid, equipmentName: 'Ventilador', locationLabel: 'UCI', floor: 3,
    symptomLabel: 'No enciende', reporterId: reporter.id, reporterName: reporter.name,
  }])
})
