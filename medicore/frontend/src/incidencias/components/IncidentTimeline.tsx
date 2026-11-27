import { Card } from '../../shared/components'
import type { Incident } from '../../shared/types'

const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })

export function IncidentTimeline({ incident }: { incident: Incident }) {
  const events = [
    { label: 'Incidente registrado', at: incident.createdAt, actor: incident.reportedBy },
    { label: 'Recepción confirmada', at: incident.acknowledgedAt },
    { label: 'Diagnóstico registrado', at: incident.diagnosis?.recordedAt, actor: incident.diagnosis?.author },
    { label: 'Incidente resuelto', at: incident.resolvedAt },
  ].flatMap(({ label, at, actor }) => {
    const timestamp = at ? Date.parse(at) : NaN
    return at && Number.isFinite(timestamp) ? [{ label, at, actor, timestamp }] : []
  }).sort((first, second) => first.timestamp - second.timestamp)

  if (!events.length) return null

  return <Card className="p-5 sm:p-6">
    <h2 id="incident-timeline-title" className="border-b border-line pb-3 font-semibold">Línea de tiempo</h2>
    <ol role="list" aria-labelledby="incident-timeline-title" aria-live="polite" className="mt-4">
      {events.map(({ label, at, actor, timestamp }) => (
        <li key={label} className="group relative pb-4 pl-6 last:pb-0">
          <span aria-hidden="true" className="absolute -bottom-1 left-[5px] top-3 w-px bg-line group-last:hidden" />
          <span aria-hidden="true" className="absolute left-0 top-1 size-3 rounded-full border-2 border-accent bg-surface" />
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-0.5 break-words text-xs text-muted">
            <time dateTime={at}>{dateFormat.format(timestamp)}</time>
            {actor && <> · {actor}</>}
          </p>
        </li>
      ))}
    </ol>
  </Card>
}

