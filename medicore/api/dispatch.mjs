import { createApp } from '../backend/dist/app.js'
import { createPrismaClient } from '../backend/dist/shared/infrastructure/persistence/prisma/client.js'

let app

export default function handler(request, response) {
  const url = new URL(request.url, 'http://localhost')
  const routedPath = url.searchParams.get('__medicore_path')
  if (routedPath !== null) {
    const isValid = /^\/api(?:\/[a-zA-Z0-9_.~!$&'()+,;=:@%/-]*)?$/.test(routedPath)
    if (!isValid) {
      response.writeHead(400, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ error: 'Ruta API inválida.' }))
      return
    }
    url.searchParams.delete('__medicore_path')
    request.url = routedPath + url.search
  }

  if (!app) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      response.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      response.end(JSON.stringify({ status: 'unavailable', database: 'unavailable' }))
      return
    }
    app = createApp(createPrismaClient(connectionString))
  }

  app(request, response)
}
