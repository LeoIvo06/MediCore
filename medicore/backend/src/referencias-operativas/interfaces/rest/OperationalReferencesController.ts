import { Router } from 'express'
import type { RequireDemoRole } from '../../../shared/interfaces/rest/DemoAuthorization.js'
import type { OperationalReferencesQueryService } from '../../application/internal/queryservices/OperationalReferencesQueryService.js'

export function createOperationalReferencesController(
  queries: OperationalReferencesQueryService,
  requireRole: RequireDemoRole,
) {
  const router = Router()

  router.get<{ id: string }>('/estaciones/:id', requireRole('admissions'), async (request, response) => {
    const station = await queries.getStation(request.params.id)
    if (!station) {
      response.status(404).json({ error: 'Estación no encontrada.' })
      return
    }
    response.json(station)
  })

  router.get<{ id: string }>('/equipos/:id', requireRole('biomedical'), async (request, response) => {
    const equipment = await queries.getEquipment(request.params.id)
    if (!equipment) {
      response.status(404).json({ error: 'Equipo no encontrado.' })
      return
    }
    response.json(equipment)
  })

  return router
}
