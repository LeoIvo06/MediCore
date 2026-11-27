import { Router } from 'express'

export function createHealthController(checkDatabase: () => Promise<void>) {
  const router = Router()

  router.get('/health', async (_request, response) => {
    response.set('Cache-Control', 'no-store')
    try {
      await checkDatabase()
      response.json({ status: 'ok', database: 'connected' })
    } catch {
      response.status(503).json({ status: 'unavailable', database: 'unavailable' })
    }
  })

  return router
}
