import { createHash, randomBytes } from 'node:crypto'
import type { DemoPrincipal } from '../../domain/security/DemoPrincipal.js'

export interface DemoCredential {
  principal: DemoPrincipal
  passwordHash: string
}

export interface DemoSessionStore {
  save(tokenHash: string, userId: string, expiresAt: Date): Promise<void>
  findActivePrincipal(tokenHash: string, now: Date): Promise<DemoPrincipal | null>
}

const sessionLifetime = 60 * 60 * 1000
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export class DemoAuthService {
  constructor(
    private readonly findCredential: (id: string) => Promise<DemoCredential | null>,
    private readonly verifyPassword: (password: string, hash: string) => Promise<boolean>,
    private readonly sessions: DemoSessionStore,
  ) {}

  async signIn(id: string, password: string) {
    const credential = await this.findCredential(id)
    if (!credential || !(await this.verifyPassword(password, credential.passwordHash))) return null

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + sessionLifetime)
    await this.sessions.save(hashToken(token), credential.principal.id, expiresAt)
    return { token, expiresAt: expiresAt.toISOString(), user: credential.principal }
  }

  getPrincipal(token: string): Promise<DemoPrincipal | null> {
    return this.sessions.findActivePrincipal(hashToken(token), new Date())
  }
}
