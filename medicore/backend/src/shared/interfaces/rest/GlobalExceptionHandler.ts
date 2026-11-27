import type { ErrorRequestHandler } from 'express'

export const globalExceptionHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) return next(error)
  if (error?.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'El cuerpo de la solicitud debe ser JSON válido.' })
    return
  }
  if (error?.type === 'entity.too.large') {
    response.status(413).json({ error: 'El cuerpo de la solicitud es demasiado grande.' })
    return
  }
  console.error(error)
  response.status(500).json({ error: 'No se pudo completar la operación.' })
}
