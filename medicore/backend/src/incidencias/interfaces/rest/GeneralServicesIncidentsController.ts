import { Router } from 'express'
import type { RequireDemoRole } from '../../../shared/interfaces/rest/DemoAuthorization.js'
import type { GeneralServicesIncidentQueryService } from '../../application/internal/queryservices/GeneralServicesIncidentQueryService.js'
import { toGeneralServicesIncidentResource } from './transform/GeneralServicesIncidentResourceFromEntityAssembler.js'

export function createGeneralServicesIncidentsController(
  queries: GeneralServicesIncidentQueryService,
  requireRole: RequireDemoRole,
) {
  const router = Router()

  router.get('/incidencias', requireRole('general-services'), async (_request, response) => {
    const groups = await queries.listByFloor()
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

  return router
}
