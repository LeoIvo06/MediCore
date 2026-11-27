import { randomBytes } from 'node:crypto'
import type { DemoPrincipal } from '../../domain/security/DemoPrincipal.js'

export interface DemoCredential {
  principal: DemoPrincipal
  passwordHash: string
}

const sessionLifetime = 60 * 60 * 1000

export class DemoAuthService {
  private readonly sessions = new Map<string, { principal: DemoPrincipal; expiresAt: number }>()

  constructor(
    private readonly findCredential: (id: string) => Promise<DemoCredential | null>,
    private readonly verifyPassword: (password: string, hash: string) => Promise<boolean>,
  ) {}

  async signIn(id: string, password: string) {
    const credential = await this.findCredential(id)
    if (!credential || !(await this.verifyPassword(password, credential.passwordHash))) return null

    const now = Date.now()
    for (const [token, session] of this.sessions) {
      if (session.expiresAt <= now) this.sessions.delete(token)
    }
    const token = randomBytes(32).toString('hex')
    const expiresAt = now + sessionLifetime
    this.sessions.set(token, { principal: credential.principal, expiresAt })
    return { token, expiresAt: new Date(expiresAt).toISOString(), user: credential.principal }
  }

  getPrincipal(token: string): DemoPrincipal | null {
    const session = this.sessions.get(token)
    if (!session) return null
    if (session.expiresAt <= Date.now()) {
      this.sessions.delete(token)
      return null
    }
    return session.principal
  }
}
