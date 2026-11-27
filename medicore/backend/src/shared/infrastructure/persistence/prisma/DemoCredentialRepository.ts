import type { DemoCredential } from '../../../application/security/DemoAuthService.js'
import { demoRoles, type DemoRole } from '../../../domain/security/DemoPrincipal.js'
import type { PrismaClient } from './generated/client.js'

export class DemoCredentialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DemoCredential | null> {
    const user = await this.prisma.demoUser.findUnique({
      where: { id },
      select: { id: true, name: true, role: true, passwordHash: true },
    })
    if (!user) return null
    const role: DemoRole | undefined = demoRoles.find((item) => item === user.role)
    if (!role) return null
    return { principal: { id: user.id, name: user.name, role }, passwordHash: user.passwordHash }
  }
}
