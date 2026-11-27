import { Router } from 'express'
import type { GeneralServicesIncidentCommandService } from '../../application/internal/commandservices/GeneralServicesIncidentCommandService.js'
import type { RequireDemoRole } from '../../../shared/interfaces/rest/DemoAuthorization.js'
import type { GeneralServicesIncidentQueryService } from '../../application/internal/queryservices/GeneralServicesIncidentQueryService.js'
import { toGeneralServicesIncidentResource } from './transform/GeneralServicesIncidentResourceFromEntityAssembler.js'

export function createGeneralServicesIncidentsController(
  queries: GeneralServicesIncidentQueryService,
  commands: GeneralServicesIncidentCommandService,
  requireRole: RequireDemoRole,
) {
  const router = Router()

  router.get('/incidencias', requireRole('general-services'), async (request, response) => {
    const groups = await queries.listByFloor(request.query.incluirResueltos === '1')
    response.json(groups.map(({ floor, incidents }) => ({
      floor,
      incidents: incidents.map(toGeneralServicesIncidentResource),
    })))
  })

  router.get<{ id: string }>('/incidencias/:id', requireRole('general-services'), async (request, response) => {
    const id = request.params.id
    const incident = /^INC-\d{4}-\d{4,10}$/.test(id) ? await queries.find(id) : null
    if (!incident) {
      response.status(404).json({ error: 'Incidente no encontrado.' })
      return
    }
    response.json(toGeneralServicesIncidentResource(incident))
  })

  router.put<{ id: string }>('/incidencias/:id/resolucion', requireRole('general-services'), async (request, response) => {
    const id = request.params.id
    const incident = /^INC-\d{4}-\d{4,10}$/.test(id) ? await commands.resolve(id) : null
    if (!incident) {
      response.status(404).json({ error: 'Incidente no encontrado.' })
      return
    }
    response.json(toGeneralServicesIncidentResource(incident))
  })

  return router
}
