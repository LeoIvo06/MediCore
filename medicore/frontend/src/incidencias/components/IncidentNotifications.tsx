import { Bell } from 'lucide-react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoApi } from '../../shared/api/demoApi'
import type { UserRole } from '../../shared/types'
import { incidentCreatedEvent, incidentNotificationsPath, type IncidentNotification } from '../api/incidentNotifications'

const timeFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' })

export function IncidentNotifications({ role, open, onToggle, onClose, trigger }: {
  role: UserRole
  open: boolean
  onToggle: () => void
  onClose: () => void
  trigger: RefObject<HTMLButtonElement | null>
}) {
  const navigate = useNavigate()
  const [items, setItems] = useState<IncidentNotification[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [readError, setReadError] = useState(false)
  const [opening, setOpening] = useState(false)
  const [revision, setRevision] = useState(0)
  const readRequest = useRef<AbortController | null>(null)
  const unread = items?.some((item) => !item.readAt) ?? false

  useEffect(() => {
    let request: AbortController | undefined
    function refresh() {
      if (document.hidden) return
      request?.abort()
      const controller = new AbortController()
      request = controller
      demoApi<IncidentNotification[]>(role, incidentNotificationsPath, { signal: controller.signal }).then(
        (data) => { if (!controller.signal.aborted) { setItems(data); setLoadError(false) } },
        () => { if (!controller.signal.aborted) setLoadError(true) },
      )
    }

    refresh()
    const timer = window.setInterval(refresh, 8000)
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener(incidentCreatedEvent, refresh)
    return () => {
      request?.abort()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener(incidentCreatedEvent, refresh)
    }
  }, [open, revision, role])

  useEffect(() => () => readRequest.current?.abort(), [])

  async function openNotification(notification: IncidentNotification) {
    if (opening) return
    setReadError(false)
    if (!notification.readAt) {
      const controller = new AbortController()
      readRequest.current = controller
      setOpening(true)
      try {
        await demoApi(role, `${incidentNotificationsPath}/${encodeURIComponent(notification.incidentId)}/lectura`, {
          method: 'PUT', signal: controller.signal,
        })
      } catch {
        if (!controller.signal.aborted) setReadError(true)
        return
      } finally {
        if (!controller.signal.aborted) setOpening(false)
      }
      if (controller.signal.aborted) return
      setItems((current) => current?.map((item) => item.incidentId === notification.incidentId ? { ...item, readAt: new Date().toISOString() } : item) ?? null)
      setRevision((value) => value + 1)
    }
    onClose()
    navigate(`/incidentes/${encodeURIComponent(notification.incidentId)}`)
  }

  return (
    <div className="sm:relative">
      <button
        ref={trigger}
        type="button"
        className="relative grid size-11 place-items-center rounded-lg border border-line text-ink hover:bg-slate-100"
        onClick={onToggle}
        aria-label={unread ? 'Notificaciones sin leer' : 'Notificaciones'}
        aria-controls="incident-notifications"
        aria-expanded={open}
      >
        <Bell size={18} aria-hidden="true" />
        {unread && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" aria-hidden="true" />}
      </button>
      <section
        id="incident-notifications"
        aria-label="Notificaciones"
        hidden={!open}
        className="absolute inset-x-3 top-full mt-1 overflow-hidden rounded-lg border border-line bg-surface shadow-xl sm:left-auto sm:right-0 sm:w-80"
      >
        <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">Notificaciones</h2>
        <div className="max-h-[min(24rem,calc(100dvh-8rem))] overflow-y-auto">
          {readError && <p role="alert" className="px-4 py-3 text-sm text-red-600">No se pudo abrir la notificación. Vuelve a intentarlo.</p>}
          {loadError && <p role="status" className="px-4 py-3 text-sm text-muted">No se pudieron actualizar las notificaciones.</p>}
          {!items && !loadError && <p role="status" className="px-4 py-3 text-sm text-muted">Cargando notificaciones…</p>}
          {items?.length === 0 && !loadError && <p className="px-4 py-3 text-sm text-muted">Aún no tienes notificaciones.</p>}
          <ul className="divide-y divide-line">
            {items?.map((item) => (
              <li key={item.incidentId}>
                <button type="button" onClick={() => void openNotification(item)} disabled={opening} className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-slate-50">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.readAt ? 'bg-transparent' : 'bg-red-500'}`} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className={`block break-words text-sm ${item.readAt ? 'text-ink' : 'font-semibold text-ink'}`}>{item.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">{item.incidentId} · {timeFormat.format(new Date(item.createdAt))}</span>
                    {!item.readAt && <span className="sr-only">Sin leer</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
