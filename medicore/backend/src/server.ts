import 'dotenv/config'
import { createApp } from './app.js'
import { createPrismaClient } from './shared/infrastructure/persistence/prisma/client.js'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('Configura DATABASE_URL en backend/.env.')

const port = Number(process.env.PORT ?? 3001)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un entero entre 1 y 65535.')
}

const prisma = createPrismaClient(databaseUrl)
const app = createApp(prisma)
const host = '127.0.0.1'
const server = app.listen(port, host, () => {
  console.log(`MediCore API en http://${host}:${port}`)
})

async function shutdown() {
  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
    })
  } finally {
    await prisma.$disconnect()
  }
}

function stop() {
  void shutdown().catch((error: unknown) => {
    console.error('No se pudo cerrar la API correctamente.', error)
    process.exitCode = 1
  })
}

process.once('SIGINT', stop)
process.once('SIGTERM', stop)
