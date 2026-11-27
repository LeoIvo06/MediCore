import type { RequestHandler } from 'express'
import type { DemoAuthService } from '../../application/security/DemoAuthService.js'
import type { DemoRole } from '../../domain/security/DemoPrincipal.js'

export type RequireDemoRole = (...roles: DemoRole[]) => RequestHandler

export function createDemoAuthorization(auth: DemoAuthService): RequireDemoRole {
  return (...roles) => (request, response, next) => {
    response.set('Cache-Control', 'no-store')
    const token = /^Bearer ([a-f\d]{64})$/i.exec(request.get('authorization') ?? '')?.[1]
    const principal = token ? auth.getPrincipal(token) : null
    if (!principal) {
      response.status(401).set('WWW-Authenticate', 'Bearer').json({ error: 'Sesión de demo requerida.' })
      return
    }
    if (roles.length && !roles.includes(principal.role)) {
      response.status(403).json({ error: 'El perfil no tiene acceso a esta operación.' })
      return
    }
    response.locals.principal = principal
    next()
  }
}
