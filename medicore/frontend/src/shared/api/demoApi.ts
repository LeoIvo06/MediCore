import type { UserRole } from '../types'

const profiles: Partial<Record<UserRole, { userId: string; password: string }>> = {
  nursing: { userId: 'enfermeria', password: 'medicore-demo-cm' },
  biomedical: { userId: 'biomedica', password: 'medicore-demo-md' },
  admissions: { userId: 'admision', password: 'medicore-demo-jr' },
  'it-support': { userId: 'soporte-ti', password: 'medicore-demo-ds' },
  'general-services': { userId: 'servicios-generales', password: 'medicore-demo-sg' },
}

interface DemoSession {
  token: string
  expiresAt: string
  user: { role: UserRole }
}

export class DemoApiError extends Error {
  readonly status: number
  readonly fields: string[]

  constructor(status: number, message: string, fields: string[] = []) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

const sessions = new Map<UserRole, Promise<DemoSession>>()

async function requestResponse(path: string, options?: RequestInit) {
  const response = await fetch(`/api${path}`, options)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new DemoApiError(response.status, body?.error ?? 'No se pudo consultar MediCore.', body?.fields)
  }
  return response
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await requestResponse(path, options)
  const body = await response.json().catch(() => null)
  if (body === null) throw new DemoApiError(response.status, 'No se pudo consultar MediCore.')
  return body as T
}

function signIn(role: UserRole) {
  const profile = profiles[role]
  if (!profile) throw new DemoApiError(403, 'El perfil no tiene acceso a esta operación.')
  const pending = request<DemoSession>('/sesiones-demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  }).then((session) => {
    if (session.user.role !== role) throw new DemoApiError(403, 'El perfil de demo no coincide.')
    return session
  }).catch((error: unknown) => {
    if (sessions.get(role) === pending) sessions.delete(role)
    throw error
  })
  sessions.set(role, pending)
  return pending
}

async function authenticatedRequest<T>(
  role: UserRole, path: string, options: RequestInit, transport: (path: string, options: RequestInit) => Promise<T>,
): Promise<T> {
  let pending = sessions.get(role) ?? signIn(role)
  const session = await pending
  if (Date.parse(session.expiresAt) <= Date.now()) {
    pending = sessions.get(role) === pending ? signIn(role) : sessions.get(role) ?? signIn(role)
  }
  const send = async (sessionPromise: Promise<DemoSession>) => {
    const { token } = await sessionPromise
    options.signal?.throwIfAborted()
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return transport(path, { ...options, headers })
  }

  try {
    return await send(pending)
  } catch (error) {
    if (!(error instanceof DemoApiError) || error.status !== 401 || options.signal?.aborted) throw error
    const current = sessions.get(role)
    return send(current && current !== pending ? current : signIn(role))
  }
}

export function demoApi<T>(role: UserRole, path: string, options: RequestInit = {}) {
  return authenticatedRequest(role, path, options, request<T>)
}

export function demoEventStream(role: UserRole, path: string, signal: AbortSignal) {
  return authenticatedRequest(role, path, { signal, headers: { Accept: 'text/event-stream' } }, requestResponse)
}
