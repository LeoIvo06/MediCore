import type { DemoSessionStore } from '../../../application/security/DemoAuthService.js'
import { demoRoles } from '../../../domain/security/DemoPrincipal.js'
import type { PrismaClient } from './generated/client.js'

export class DemoSessionRepositoryAdapter implements DemoSessionStore {
  constructor(private readonly prisma: PrismaClient) {}

  async save(tokenHash: string, userId: string, expiresAt: Date) {
    await this.prisma.$transaction([
      this.prisma.demoSession.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
      this.prisma.demoSession.create({ data: { tokenHash, userId, expiresAt } }),
    ])
  }

  async findActivePrincipal(tokenHash: string, now: Date) {
    const session = await this.prisma.demoSession.findUnique({
      where: { tokenHash, expiresAt: { gt: now } },
      select: { user: { select: { id: true, name: true, role: true } } },
    })
    if (!session) return null
    const role = demoRoles.find((value) => value === session.user.role)
    return role ? { ...session.user, role } : null
  }
}
