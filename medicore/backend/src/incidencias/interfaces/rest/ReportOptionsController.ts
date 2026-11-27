import { Router } from 'express'
import type { RequireDemoRole } from '../../../shared/interfaces/rest/DemoAuthorization.js'
import type { ReportOptionsQueryService } from '../../application/internal/queryservices/ReportOptionsQueryService.js'

export function createReportOptionsController(queries: ReportOptionsQueryService, requireRole: RequireDemoRole) {
  const router = Router()
  router.get('/opciones-reporte', requireRole('nursing'), async (_request, response) => {
    response.json(await queries.getReportOptions())
  })
  return router
}
