import { Router } from 'express'
import type { RequireDemoRole } from '../../../shared/interfaces/rest/DemoAuthorization.js'
import type { IncidentNotificationService } from '../../application/internal/IncidentNotificationService.js'

export function createIncidentNotificationsController(service: IncidentNotificationService, requireRole: RequireDemoRole) {
  const router = Router()

  router.get('/', requireRole(), async (_request, response) => {
    response.json(await service.list(response.locals.principal.id))
  })

  router.put<{ id: string }>('/:id/lectura', requireRole(), async (request, response) => {
    const found = await service.markRead(response.locals.principal.id, request.params.id)
    if (!found) {
      response.status(404).json({ error: 'Notificación no encontrada.' })
      return
    }
    response.json({ read: true })
  })

  return router
}
