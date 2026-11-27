import express from 'express'
import { createHealthController } from './shared/interfaces/rest/HealthController.js'

export function createApp(checkDatabase: () => Promise<void>) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json())
  app.use('/api', createHealthController(checkDatabase))
  return app
}
