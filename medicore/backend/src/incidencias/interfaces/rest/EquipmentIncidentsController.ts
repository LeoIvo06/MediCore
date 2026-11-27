import { Router } from 'express'
import type { RequireDemoRole } from '../../../shared/interfaces/rest/DemoAuthorization.js'
import type { EquipmentIncidentCommandService } from '../../application/internal/commandservices/EquipmentIncidentCommandService.js'
import type { EquipmentIncidentQueryService } from '../../application/internal/queryservices/EquipmentIncidentQueryService.js'
import { toEquipmentIncidentCommand } from './transform/CreateEquipmentIncidentCommandFromResourceAssembler.js'
import { toEquipmentIncidentResource } from './transform/EquipmentIncidentResourceFromEntityAssembler.js'

function equipmentNumber(id: string) {
  const match = /^INC-EQ-(\d{6,10})$/.exec(id)
  const number = Number(match?.[1])
  return number > 0 && number <= 2147483647 && String(number).padStart(6, '0') === match?.[1] ? number : null
}

export function createEquipmentIncidentsController(
  commands: EquipmentIncidentCommandService,
  queries: EquipmentIncidentQueryService,
  requireRole: RequireDemoRole,
) {
  const router = Router()

  router.post('/equipos', requireRole('nursing'), async (request, response) => {
    const result = await commands.create(toEquipmentIncidentCommand(request.body), response.locals.principal)
    if (result.status === 'invalid') {
      response.status(422).json({ error: 'Revisa el equipo, la ubicación y el síntoma.', fields: result.fields })
      return
    }
    const incident = toEquipmentIncidentResource(result.incident)
    response.location(`/api/incidencias/equipos/${incident.id}`).status(201).json(incident)
  })

  router.get('/equipos', requireRole('biomedical'), async (_request, response) => {
    response.json((await queries.listBiomedical()).map(toEquipmentIncidentResource))
  })

  router.get('/equipos/mis-reportes', requireRole('nursing'), async (_request, response) => {
    response.json((await queries.listForReporter(response.locals.principal)).map(toEquipmentIncidentResource))
  })

  router.get<{ id: string }>('/equipos/:id', requireRole('nursing', 'biomedical'), async (request, response) => {
    const number = equipmentNumber(request.params.id)
    const result = number === null ? { status: 'missing' as const } : await queries.find(number, response.locals.principal)
    if (result.status === 'missing') {
      response.status(404).json({ error: 'Incidente no encontrado.' })
      return
    }
    if (result.status === 'forbidden') {
      response.status(403).json({ error: 'No tienes acceso a este incidente.' })
      return
    }
    response.json(toEquipmentIncidentResource(result.incident))
  })

  router.put<{ id: string }>('/equipos/:id/resolucion', requireRole('biomedical'), async (request, response) => {
    const number = equipmentNumber(request.params.id)
    const result = number === null ? { status: 'missing' as const } : await commands.resolve(number, response.locals.principal)
    if (result.status === 'forbidden') {
      response.status(403).json({ error: 'No tienes acceso a esta operación.' })
      return
    }
    if (result.status === 'missing') {
      response.status(404).json({ error: 'Incidente no encontrado.' })
      return
    }
    response.json(toEquipmentIncidentResource(result.incident))
  })

  return router
}
