import express from 'express'
import { IncidentNotificationService } from './incidencias/application/internal/IncidentNotificationService.js'
import { IncidentNotificationRepositoryAdapter } from './incidencias/infrastructure/persistence/prisma/adapters/IncidentNotificationRepositoryAdapter.js'
import { createIncidentNotificationsController } from './incidencias/interfaces/rest/IncidentNotificationsController.js'
import { GeneralServicesIncidentQueryService } from './incidencias/application/internal/queryservices/GeneralServicesIncidentQueryService.js'
import { GeneralServicesIncidentRepositoryAdapter } from './incidencias/infrastructure/persistence/prisma/adapters/GeneralServicesIncidentRepositoryAdapter.js'
import { createGeneralServicesIncidentsController } from './incidencias/interfaces/rest/GeneralServicesIncidentsController.js'
import { ITAlertCommandService } from './incidencias/application/internal/commandservices/ITAlertCommandService.js'
import { ITAlertQueryService } from './incidencias/application/internal/queryservices/ITAlertQueryService.js'
import { ITAlertRepositoryAdapter } from './incidencias/infrastructure/persistence/prisma/adapters/ITAlertRepositoryAdapter.js'
import { createITAlertsController } from './incidencias/interfaces/rest/ITAlertsController.js'
import { EquipmentIncidentCommandService } from './incidencias/application/internal/commandservices/EquipmentIncidentCommandService.js'
import { EquipmentIncidentQueryService } from './incidencias/application/internal/queryservices/EquipmentIncidentQueryService.js'
import { EquipmentIncidentRepositoryAdapter } from './incidencias/infrastructure/persistence/prisma/adapters/EquipmentIncidentRepositoryAdapter.js'
import { createEquipmentIncidentsController } from './incidencias/interfaces/rest/EquipmentIncidentsController.js'
import { ExternalOperationalReferencesService } from './incidencias/application/internal/outboundservices/acl/ExternalOperationalReferencesService.js'
import { ReportOptionsQueryService } from './incidencias/application/internal/queryservices/ReportOptionsQueryService.js'
import { createReportOptionsController } from './incidencias/interfaces/rest/ReportOptionsController.js'
import { OperationalReferencesQueryService } from './referencias-operativas/application/internal/queryservices/OperationalReferencesQueryService.js'
import { OperationalReferencesRepositoryAdapter } from './referencias-operativas/infrastructure/persistence/prisma/adapters/OperationalReferencesRepositoryAdapter.js'
import { OperationalReferencesContextFacade } from './referencias-operativas/interfaces/acl/OperationalReferencesContextFacade.js'
import { createOperationalReferencesController } from './referencias-operativas/interfaces/rest/OperationalReferencesController.js'
import { DemoAuthService } from './shared/application/security/DemoAuthService.js'
import { DemoCredentialRepository } from './shared/infrastructure/persistence/prisma/DemoCredentialRepository.js'
import { DemoSessionRepositoryAdapter } from './shared/infrastructure/persistence/prisma/DemoSessionRepositoryAdapter.js'
import type { PrismaClient } from './shared/infrastructure/persistence/prisma/generated/client.js'
import { matchesDemoPassword } from './shared/infrastructure/security/DemoPassword.js'
import { createDemoAuthorization } from './shared/interfaces/rest/DemoAuthorization.js'
import { createDemoSessionController } from './shared/interfaces/rest/DemoSessionController.js'
import { globalExceptionHandler } from './shared/interfaces/rest/GlobalExceptionHandler.js'
import { createHealthController } from './shared/interfaces/rest/HealthController.js'

export function createApp(prisma: PrismaClient) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '16kb' }))

  const users = new DemoCredentialRepository(prisma)
  const auth = new DemoAuthService((id) => users.findById(id), matchesDemoPassword, new DemoSessionRepositoryAdapter(prisma))
  const requireRole = createDemoAuthorization(auth)
  const references = new OperationalReferencesQueryService(new OperationalReferencesRepositoryAdapter(prisma))
  const facade = new OperationalReferencesContextFacade(references)
  const externalReferences = new ExternalOperationalReferencesService(facade)
  const reportOptions = new ReportOptionsQueryService(externalReferences)
  const incidents = new EquipmentIncidentRepositoryAdapter(prisma)
  const commands = new EquipmentIncidentCommandService(externalReferences, incidents)
  const queries = new EquipmentIncidentQueryService(incidents)

  app.use('/api', createHealthController(async () => { await prisma.$queryRaw`SELECT 1` }))
  app.use('/api', createDemoSessionController(auth, requireRole))
  app.use('/api/referencias', createOperationalReferencesController(references, requireRole))
  app.use('/api/incidencias', createReportOptionsController(reportOptions, requireRole))
  app.use('/api/incidencias', createEquipmentIncidentsController(commands, queries, requireRole))
  const alerts = new ITAlertRepositoryAdapter(prisma)
  app.use('/api', createITAlertsController(
    new ITAlertCommandService(externalReferences, alerts), new ITAlertQueryService(alerts), requireRole,
  ))
  const generalServices = new GeneralServicesIncidentQueryService(new GeneralServicesIncidentRepositoryAdapter(prisma))
  app.use('/api/servicios-generales', createGeneralServicesIncidentsController(generalServices, requireRole))
  const notifications = new IncidentNotificationService(new IncidentNotificationRepositoryAdapter(prisma))
  app.use('/api/notificaciones', createIncidentNotificationsController(notifications, requireRole))
  app.use(globalExceptionHandler)
  return app
}
