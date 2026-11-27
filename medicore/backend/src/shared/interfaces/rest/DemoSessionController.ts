import { Router } from 'express'
import type { DemoAuthService } from '../../application/security/DemoAuthService.js'
import type { RequireDemoRole } from './DemoAuthorization.js'

export function createDemoSessionController(auth: DemoAuthService, requireRole: RequireDemoRole) {
  const router = Router()
  router.post('/sesiones-demo', async (request, response) => {
    response.set('Cache-Control', 'no-store')
    const { userId, password } = request.body ?? {}
    if (typeof userId !== 'string' || !userId || userId.length > 64 ||
        typeof password !== 'string' || !password || password.length > 128) {
      response.status(400).json({ error: 'Ingresa userId y password.' })
      return
    }
    const session = await auth.signIn(userId, password)
    if (!session) {
      response.status(401).json({ error: 'Credenciales de demo inválidas.' })
      return
    }
    response.status(201).json(session)
  })

  router.get('/sesiones-demo/actual', requireRole(), (_request, response) => {
    response.json({ user: response.locals.principal })
  })

  return router
}
