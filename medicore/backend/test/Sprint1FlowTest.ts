import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { once } from 'node:events'
import { test } from 'node:test'
import type { AddressInfo } from 'node:net'
import { createApp } from '../src/app.js'
import { createPrismaClient } from '../src/shared/infrastructure/persistence/prisma/client.js'

function composeArgs(project: string) {
  return ['compose', '--project-name', project, '--env-file', '.env.example']
}

test('Sprint 1: las siete historias se ejercitan por HTTP y los datos sobreviven al reinicio', { timeout: 120_000 }, async (t) => {
  const project = process.env.MEDICORE_TEST_COMPOSE_PROJECT
  const database = process.env.DATABASE_URL
  assert.match(project ?? '', /^medicore-sprint1-[a-f0-9]{8}$/)
  assert.ok(database && project, 'Ejecuta npm run test:integration.')
  const testAddress = execFileSync('docker', [...composeArgs(project), 'port', 'postgres', '5432'], { encoding: 'utf8' }).trim()
  assert.equal(new URL(database).host, testAddress)

  const start = async (url: string) => {
    let closed = false
    const prisma = createPrismaClient(url)
    const server = createApp(prisma, url).listen(0, '127.0.0.1')
    await once(server, 'listening')
    return {
      api: `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`,
      prisma,
      async close() {
        if (closed) return
        closed = true
        try {
          await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
        } finally {
          await prisma.$disconnect()
        }
      },
    }
  }

  let server = await start(database)
  t.after(async () => { await server.close() })
  async function request<T>(path: string, status: number, token?: string, method = 'GET', body?: unknown): Promise<T> {
    const headers = new Headers()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (body !== undefined) headers.set('Content-Type', 'application/json')
    const response = await fetch(server.api + path, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(8_000),
    })
    assert.equal(response.status, status, `${method} ${path}`)
    return response.json() as Promise<T>
  }

  async function login(userId: string, password: string) {
    return (await request<{ token: string }>('/sesiones-demo', 201, undefined, 'POST', { userId, password })).token
  }

  type Ticket = {
    id: string
    equipmentId?: string
    location: string
    symptom: string
    incidentType?: string
    priority: string
    ip?: string
    acknowledgedAt?: string
    open?: boolean
    status: string
    resolvedAt?: string
  }
  const equipmentPath = '/incidencias/equipos'
  const alertPath = '/alertas-ti'
  const itPath = '/soporte-ti/alertas'
  const generalPath = '/servicios-generales/incidencias'
  const nursing = await login('enfermeria', 'medicore-demo-cm')
  const biomedical = await login('biomedica', 'medicore-demo-md')
  const admissions = await login('admision', 'medicore-demo-jr')
  const support = await login('soporte-ti', 'medicore-demo-ds')
  const general = await login('servicios-generales', 'medicore-demo-sg')
  let equipmentId = ''
  let alertId = ''
  let acknowledgedAt: string | undefined

  await t.test('HU-CM1 y HU-MD1: se valida el reporte y se abre el historial del equipo asociado', async () => {
    const health = await request<{ database: string }>('/health', 200)
    assert.equal(health.database, 'connected')
    await request('/incidencias/opciones-reporte', 401)
    await request('/incidencias/opciones-reporte', 403, admissions)
    await request('/incidencias/opciones-reporte', 200, nursing)
    const incomplete = await request<{ fields: string[] }>(equipmentPath, 422, nursing, 'POST', { locationId: 'emergencia-1' })
    assert.deepEqual(incomplete.fields, ['equipmentId', 'symptomId'])
    assert.deepEqual(await request(equipmentPath, 200, biomedical), [])

    const subscription = new AbortController()
    try {
      const stream = await fetch(server.api + '/notificaciones/eventos', {
        headers: { Authorization: `Bearer ${biomedical}` },
        signal: AbortSignal.any([subscription.signal, AbortSignal.timeout(10_000)]),
      })
      assert.equal(stream.status, 200)
      assert.match(stream.headers.get('content-type') ?? '', /^text\/event-stream/)
      const reader = stream.body!.pipeThrough(new TextDecoderStream()).getReader()
      assert.match((await reader.read()).value ?? '', /data: ready/)
      const report = await request<Ticket>(equipmentPath, 201, nursing, 'POST', {
        equipmentId: 'eq-monitor-04567', locationId: 'emergencia-1', symptomId: 'no-enciende',
      })
      equipmentId = report.id
      assert.match((await reader.read()).value ?? '', /data: update/)
    } finally {
      subscription.abort()
    }
    assert.match(equipmentId, /^INC-EQ-\d+$/)
    const list = await request<Ticket[]>(equipmentPath, 200, biomedical)
    assert.deepEqual(list.map(({ id }) => id), [equipmentId])
    const detail = await request<Ticket>(`${equipmentPath}/${equipmentId}`, 200, biomedical)
    assert.equal(detail.equipmentId, 'eq-monitor-04567')
    await request(`${equipmentPath}/${equipmentId}`, 403, support)
    const asset = await request<{ id: string; maintenance: { id: string }[] }>(`/referencias/equipos/${detail.equipmentId}`, 200, biomedical)
    assert.equal(asset.id, detail.equipmentId)
    assert.deepEqual(asset.maintenance.map(({ id }) => id), ['mtto-monitor-1'])
    await request('/referencias/equipos/ausente', 404, biomedical)
  })

  await t.test('HU-JR1, HU-TI1 y HU-TI5: alerta crítica, acceso técnico y primer acuse', async () => {
    for (const [stationId, fields] of [
      ['ADM-02', ['ip']], ['ADM-03', ['location']], ['ADM-04', ['location', 'ip']],
    ] as const) {
      const result = await request<{ fields: string[] }>(alertPath, 422, admissions, 'POST', { stationId })
      assert.deepEqual(result.fields, fields)
    }
    assert.deepEqual(await request(itPath, 200, support), [])

    const alert = await request<Ticket>(alertPath, 201, admissions, 'POST', { stationId: 'ADM-01' })
    alertId = alert.id
    assert.equal(alert.priority, 'Crítica')
    const inbox = await request<Ticket[]>(itPath, 200, support)
    assert.deepEqual(inbox.map(({ id }) => id), [alertId])

    const path = `${alertPath}/${alertId}`
    const detail = await request<Ticket>(path, 200, support)
    assert.equal(detail.ip, '10.20.1.41')
    assert.equal(detail.location, 'Módulo de Admisión · Planta 1')
    assert.equal(detail.symptom, 'Estación bloqueada')
    assert.equal(detail.incidentType, 'Bloqueo de estación')
    await request(path, 403, general)
    await request(`${path}/acuse`, 403, admissions, 'PUT')

    const other = await server.prisma.demoUser.findUniqueOrThrow({ where: { id: 'admision' } })
    await server.prisma.demoUser.create({ data: { ...other, id: 'admision-alterna', name: 'Admisión alterna' } })
    const alternate = await login('admision-alterna', 'medicore-demo-jr')
    await request(path, 403, alternate)
    const results = await Promise.all(Array.from({ length: 4 }, () => request<Ticket>(`${path}/acuse`, 200, support, 'PUT')))
    acknowledgedAt = results[0].acknowledgedAt
    assert.ok(acknowledgedAt)
    for (const result of results) {
      assert.equal(result.acknowledgedAt, acknowledgedAt)
      assert.equal(result.open, true)
    }
    assert.equal((await request<Ticket>(path, 200, admissions)).acknowledgedAt, acknowledgedAt)
    await request(path, 403, alternate)

    const legacy = await server.prisma.iTAlert.create({ data: {
      stationId: 'ADM-02', location: detail.location, floor: 1, reporterId: 'admision', reporterName: 'Jorge Ramírez',
    } })
    const legacyId = `INC-TI-${String(legacy.number).padStart(6, '0')}`
    assert.equal((await request<Ticket>(`${alertPath}/${legacyId}`, 200, support)).ip, undefined)
  })

  await t.test('HU-JUR1 y HU-JUR2: agrupa, prioriza y permite consultar el detalle técnico', async () => {
    const groups = await request<{ floor: number; incidents: Ticket[] }[]>(generalPath, 200, general)
    assert.deepEqual(groups.map(({ floor, incidents }) => [floor, incidents.map(({ id }) => id)]), [
      [1, ['INC-2026-0139']], [3, ['INC-2026-0140', 'INC-2026-0141', 'INC-2026-0143']],
    ])
    const path = `${generalPath}/INC-2026-0141`
    const detail = await request<Ticket>(path, 200, general)
    assert.equal(detail.id, 'INC-2026-0141')
    assert.equal(detail.incidentType, 'Equipo de oficina')
    assert.equal(detail.location, 'Laboratorio · Estación de impresión 1')
    assert.equal(detail.symptom, 'Trabajos de impresión en espera')
    await request(path, 403, support)
  })

  const notificationPath = '/notificaciones'
  type Notice = { incidentId: string; readAt: string | null }

  await t.test('las notificaciones se crean para el reportante y el área, con lectura individual', async () => {
    await request(notificationPath, 401)
    const ownReport = await request<Notice[]>(notificationPath, 200, nursing)
    const areaReport = await request<Notice[]>(notificationPath, 200, biomedical)
    const ownAlert = await request<Notice[]>(notificationPath, 200, admissions)
    const areaAlert = await request<Notice[]>(notificationPath, 200, support)
    assert.deepEqual(ownReport.map(({ incidentId, readAt }) => [incidentId, readAt]), [[equipmentId, null]])
    assert.deepEqual(areaReport, ownReport)
    assert.deepEqual(ownAlert.map(({ incidentId, readAt }) => [incidentId, readAt]), [[alertId, null]])
    assert.deepEqual(areaAlert, ownAlert)
    assert.deepEqual(await request(notificationPath, 200, general), [])
    await request(notificationPath + '/' + equipmentId + '/lectura', 404, support, 'PUT')
    const readingPath = notificationPath + '/' + equipmentId + '/lectura'
    await request(readingPath, 200, biomedical, 'PUT')
    const firstRead = (await request<Notice[]>(notificationPath, 200, biomedical))[0].readAt
    assert.ok(firstRead)
    await request(readingPath, 200, biomedical, 'PUT')
    assert.equal((await request<Notice[]>(notificationPath, 200, biomedical))[0].readAt, firstRead)
    assert.equal((await request<Notice[]>(notificationPath, 200, nursing))[0].readAt, null)
  })

  const generalId = 'INC-2026-0141'
  await t.test('solo el área responsable resuelve y la bandeja conserva el nuevo estado', async () => {
    const operations = [
      [equipmentPath, equipmentId, biomedical, nursing],
      [alertPath, alertId, support, admissions],
      [generalPath, generalId, general, support],
    ] as const
    for (const [path, id, owner, reporter] of operations) {
      const endpoint = `${path}/${id}/resolucion`
      await request(endpoint, 401, undefined, 'PUT')
      await request(endpoint, 403, reporter, 'PUT')
      const results = await Promise.all(Array.from({ length: 2 }, () => request<Ticket>(endpoint, 200, owner, 'PUT')))
      assert.ok(results[0].resolvedAt)
      for (const result of results) {
        assert.equal(result.status, 'Resuelto')
        assert.equal(result.open, false)
        assert.equal(result.resolvedAt, results[0].resolvedAt)
      }
    }
    assert.equal((await request<Ticket[]>(equipmentPath, 200, biomedical)).find(({ id }) => id === equipmentId)?.status, 'Resuelto')
    assert.equal((await request<Ticket[]>(itPath, 200, support)).find(({ id }) => id === alertId)?.status, 'Resuelto')
    const all = await request<{ incidents: Ticket[] }[]>(generalPath + '?incluirResueltos=1', 200, general)
    assert.equal(all.flatMap(({ incidents }) => incidents).find(({ id }) => id === generalId)?.status, 'Resuelto')
    const active = await request<{ incidents: Ticket[] }[]>(generalPath, 200, general)
    assert.equal(active.flatMap(({ incidents }) => incidents).some(({ id }) => id === generalId), false)
  })

  await t.test('las sesiones, el reporte y el primer acuse sobreviven a la recreación de PostgreSQL', async () => {
    await server.close()
    const args = composeArgs(project)
    execFileSync('docker', [...args, 'up', '-d', '--force-recreate', '--wait'], { stdio: 'inherit' })
    const address = execFileSync('docker', [...args, 'port', 'postgres', '5432'], { encoding: 'utf8' }).trim()
    assert.match(address, /^127\.0\.0\.1:[1-9]\d+$/)
    const url = new URL(database)
    url.host = address
    server = await start(url.href)
    await request(`${equipmentPath}/${equipmentId}`, 200, biomedical)
    const alert = await request<Ticket>(`${alertPath}/${alertId}`, 200, admissions)
    await request(`${alertPath}/${alertId}`, 403, biomedical)
    assert.equal(alert.acknowledgedAt, acknowledgedAt)
    assert.equal(alert.open, false)
    assert.equal(alert.status, 'Resuelto')
    assert.equal((await request<Ticket>(`${generalPath}/${generalId}`, 200, general)).status, 'Resuelto')
    assert.ok((await request<Notice[]>(notificationPath, 200, biomedical))[0].readAt)
    assert.equal((await request<Notice[]>(notificationPath, 200, nursing))[0].readAt, null)
  })
})
