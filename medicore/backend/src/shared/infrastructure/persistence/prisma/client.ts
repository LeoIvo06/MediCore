import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client.js'

export function createPrismaClient(connectionString: string) {
  const adapter = new PrismaPg({ connectionString, connectionTimeoutMillis: 2000 })
  return new PrismaClient({ adapter })
}
