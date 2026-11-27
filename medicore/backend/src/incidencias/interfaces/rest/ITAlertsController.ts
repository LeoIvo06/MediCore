import { Router, type Response } from 'express'
import type { RequireDemoRole } from '../../../shared/interfaces/rest/DemoAuthorization.js'
import type { ITAlertCommandService } from '../../application/internal/commandservices/ITAlertCommandService.js'
import type { ITAlertQueryService } from '../../application/internal/queryservices/ITAlertQueryService.js'
import type { ITAlert } from '../../domain/model/aggregates/ITAlert.js'
import { toITAlertCommand } from './transform/CreateITAlertCommandFromResourceAssembler.js'
import { toITAlertResource } from './transform/ITAlertResourceFromEntityAssembler.js'

function alertNumber(id: string) {
  const match = /^INC-TI-(\d{6,10})$/.exec(id)
  const number = Number(match?.[1])
  return number > 0 && number <= 2147483647 && String(number).padStart(6, '0') === match?.[1] ? number : null
}

function sendResult(response: Response, result: { status: 'found'; alert: ITAlert } | { status: 'missing' | 'forbidden' }) {
  if (result.status === 'found') {
    response.json(toITAlertResource(result.alert))
    return
  }
  if (result.status === 'forbidden') {
    response.status(403).json({ error: 'No tienes acceso a esta alerta.' })
    return
  }
  response.status(404).json({ error: 'Alerta no encontrada.' })
}

export function createITAlertsController(commands: ITAlertCommandService, queries: ITAlertQueryService, requireRole: RequireDemoRole) {
  const router = Router()

  router.post('/alertas-ti', requireRole('admissions'), async (request, response) => {
    const result = await commands.create(toITAlertCommand(request.body), response.locals.principal)
    if (result.status === 'invalid') {
      response.status(422).json({ error: 'Revisa la configuración de la estación.', fields: result.fields })
      return
    }
    const resource = toITAlertResource(result.alert)
    response.location(`/api/alertas-ti/${resource.id}`).status(201).json(resource)
  })

  router.get('/alertas-ti', requireRole('admissions'), async (_request, response) => {
    response.json((await queries.listForReporter(response.locals.principal.id)).map(toITAlertResource))
  })

  router.get('/soporte-ti/alertas', requireRole('it-support'), async (_request, response) => {
    response.json((await queries.listForSupport()).map(toITAlertResource))
  })

  router.get<{ id: string }>('/alertas-ti/:id', requireRole('admissions', 'it-support'), async (request, response) => {
    const number = alertNumber(request.params.id)
    const result = number === null ? { status: 'missing' as const } : await queries.find(number, response.locals.principal)
    sendResult(response, result)
  })

  router.put<{ id: string }>('/alertas-ti/:id/acuse', requireRole('it-support'), async (request, response) => {
    const number = alertNumber(request.params.id)
    const result = number === null ? { status: 'missing' as const } : await commands.acknowledge(number, response.locals.principal)
    sendResult(response, result)
  })

  router.put<{ id: string }>('/alertas-ti/:id/resolucion', requireRole('it-support'), async (request, response) => {
    const number = alertNumber(request.params.id)
    const result = number === null ? { status: 'missing' as const } : await commands.resolve(number, response.locals.principal)
    sendResult(response, result)
  })

  return router
}
