import { Router } from 'express'
import type { RequireDemoRole } from '../../../shared/interfaces/rest/DemoAuthorization.js'
import type { IncidentNotificationService } from '../../application/internal/IncidentNotificationService.js'

type NotificationStream = (recipientId: string, signal: AbortSignal, ready: () => void, notify: () => void) => Promise<void>

export function createIncidentNotificationsController(
  service: IncidentNotificationService, requireRole: RequireDemoRole, stream?: NotificationStream,
) {
  const router = Router()

  router.get('/', requireRole(), async (_request, response) => {
    response.json(await service.list(response.locals.principal.id))
  })

  router.get('/eventos', requireRole(), async (_request, response) => {
    if (!stream) {
      response.status(503).json({ error: 'Actualización en vivo no disponible.' })
      return
    }
    const controller = new AbortController()
    response.once('close', () => controller.abort())
    const timer = setTimeout(() => controller.abort(), 22_000)
    try {
      await stream(response.locals.principal.id, controller.signal, () => {
        response.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store, no-transform' })
        response.write('data: ready\n\n')
      }, () => {
        if (response.headersSent && !response.writableEnded && !controller.signal.aborted) response.write('data: update\n\n')
      })
    } catch {
      if (!response.headersSent && !controller.signal.aborted) response.status(503)
    } finally {
      clearTimeout(timer)
      if (!response.writableEnded) response.end()
    }
  })

  router.put('/lectura', requireRole(), async (request, response) => {
    const cutoff = request.body?.through
    const through = new Date(typeof cutoff === 'string' ? cutoff : '')
    if (!Number.isFinite(through.getTime()) || through.toISOString() !== cutoff || through.getTime() > Date.now()) {
      response.status(422).json({ error: 'Actualiza la lista de notificaciones y vuelve a intentarlo.' })
      return
    }
    response.json(await service.markAllRead(response.locals.principal.id, through))
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
