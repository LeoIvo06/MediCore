import { ArrowRight, ClipboardList, PlusCircle, RefreshCw, Siren, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageTitle, PriorityBadge, StatusBadge } from '../../shared/components'
import { roleLabels, type Incident, type UserRole } from '../../shared/types'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import { equipmentIncidentsPath, myEquipmentReportsPath } from '../api/equipmentIncidents'
import { generalServicesIncidentsPath, type GeneralServicesFloorGroup } from '../api/generalServicesIncidents'
import { itAlertsPath, supportAlertsPath } from '../api/itAlerts'
import { useIncidents } from '../context/IncidentContext'

const panels = {
  nursing: { path: myEquipmentReportsPath, heading: 'Mis reportes de equipos', activity: 'Reportes recientes', groups: 'Abiertos por ubicación', group: (incident: Incident) => incident.location },
  admissions: { path: itAlertsPath, heading: 'Mis alertas de Admisión', activity: 'Alertas enviadas recientemente', groups: 'Abiertas por estación', group: (incident: Incident) => incident.stationId ?? 'Sin estación' },
  biomedical: { path: equipmentIncidentsPath, heading: 'Incidencias de Ingeniería Biomédica', activity: 'Reportes biomédicos recientes', groups: 'Abiertas por equipo', group: (incident: Incident) => incident.title },
  'it-support': { path: supportAlertsPath, heading: 'Alertas de Soporte TI', activity: 'Alertas recibidas recientemente', groups: 'Abiertas por estación', group: (incident: Incident) => incident.stationId ?? 'Sin estación' },
  'general-services': { path: `${generalServicesIncidentsPath}?incluirResueltos=1`, heading: 'Incidencias de Servicios Generales', activity: 'Incidencias técnicas recientes', groups: 'Abiertas por piso', group: (incident: Incident) => `Piso ${incident.floor}` },
} satisfies Record<UserRole, { path: string; heading: string; activity: string; groups: string; group: (incident: Incident) => string }>

const dateFormat = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima',
})

function metricsFor(role: UserRole, incidents: Incident[], open: Incident[]) {
  const resolved = incidents.length - open.length
  const critical = open.filter(({ priority }) => priority === 'Crítica').length
  const pendingReceipt = open.filter(({ acknowledgedAt }) => !acknowledgedAt).length

  switch (role) {
    case 'nursing':
      return [
        ['Reportes enviados', incidents.length], ['Reportes abiertos', open.length],
        ['Resueltos', resolved], ['Equipos reportados', new Set(incidents.flatMap(({ equipmentId }) => equipmentId ? [equipmentId] : [])).size],
      ] as const
    case 'admissions':
      return [
        ['Alertas enviadas', incidents.length], ['Abiertas sin acuse', pendingReceipt],
        ['Con acuse', incidents.filter(({ acknowledgedAt }) => acknowledgedAt).length], ['Resueltas', resolved],
      ] as const
    case 'biomedical':
      return [
        ['Reportes recibidos', incidents.length], ['Pendientes de resolver', open.length],
        ['Equipos con casos abiertos', new Set(open.flatMap(({ equipmentId }) => equipmentId ? [equipmentId] : [])).size], ['Resueltos', resolved],
      ] as const
    case 'it-support':
      return [
        ['Alertas recibidas', incidents.length], ['Abiertas sin acuse', pendingReceipt],
        ['Críticas abiertas', critical], ['Resueltas', resolved],
      ] as const
    case 'general-services':
      return [
        ['Incidencias registradas', incidents.length], ['Abiertas', open.length],
        ['Críticas abiertas', critical], ['Resueltas', resolved],
      ] as const
  }
}

export default function HomePage() {
  const role = useIncidents().state.activeRole
  const profile = roleLabels[role]
  const shortcuts = role === 'nursing'
    ? [{ title: 'Reportar falla en equipo médico', text: 'Registra el equipo, la ubicación y el síntoma observado.', to: '/reportar-falla', Icon: PlusCircle }]
    : role === 'admissions'
      ? [{ title: 'Enviar alerta rápida a TI', text: 'Envía una alerta y consulta el acuse desde el historial.', to: '/alerta-ti', Icon: Siren }]
      : [
          { title: role === 'biomedical' ? 'Abrir bandeja biomédica' : role === 'it-support' ? 'Abrir bandeja de alertas TI' : 'Consultar bandeja por piso', text: 'Revisa, filtra y exporta los casos de tu área.', to: '/bandeja', Icon: ClipboardList },
          ...(role === 'biomedical' ? [{ title: 'Ficha técnica del ventilador', text: 'Consulta la información del activo y su historial de mantenimiento.', to: '/equipos/eq-vent-00123', Icon: Stethoscope }] : []),
        ]

  return <>
    <PageTitle title="Centro de control" description={`${profile.name} · ${profile.title}`} />
    <section aria-labelledby="quick-actions-title" className="mb-7">
      <h2 id="quick-actions-title" className="mb-3 text-sm font-semibold">Acciones rápidas</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {shortcuts.map(({ title, text, to, Icon }) => (
          <Link key={to} to={to} className="mc-card flex items-center gap-3 p-4 hover:border-brand/40 hover:bg-slate-50">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cyan-50 text-accent"><Icon size={21} aria-hidden="true" /></span>
            <span className="min-w-0"><span className="block font-semibold text-ink">{title}</span><span className="mt-1 block text-sm text-muted">{text}</span></span>
            <ArrowRight size={19} className="ml-auto shrink-0 text-accent" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
    <IncidentOverview key={role} role={role} />
  </>
}

function IncidentOverview({ role }: { role: UserRole }) {
  const [revision, setRevision] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const panel = panels[role]
  const query = useDemoQuery<Incident[] | GeneralServicesFloorGroup[]>(role, panel.path, revision)
  const incidents = role === 'general-services'
    ? (query.data as GeneralServicesFloorGroup[] | null)?.flatMap(({ incidents }) => incidents) ?? []
    : (query.data as Incident[] | null) ?? []
  const open = incidents.filter((incident) => incident.open !== false)
  const sorted = [...incidents].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const metrics = metricsFor(role, incidents, open)
  const groups = new Map<string, number>()
  for (const incident of open) {
    const label = panel.group(incident)
    groups.set(label, (groups.get(label) ?? 0) + 1)
  }
  const distribution = [...groups].sort(([name, a], [other, b]) => b - a || name.localeCompare(other, 'es-PE', { numeric: true }))

  return <section aria-labelledby="summary-title" aria-busy={query.loading}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 id="summary-title" className="text-lg font-semibold">{panel.heading}</h2>
      <button type="button" className="mc-button mc-button-secondary mc-button-compact" onClick={() => setRevision((previous) => previous + 1)} disabled={query.loading}>
        <RefreshCw size={15} aria-hidden="true" /> Actualizar
      </button>
    </div>
    {query.loading && <p role="status" className="text-sm text-muted">Cargando el resumen…</p>}
    {query.error && <p role="alert" className="text-sm text-red-600">No se pudo cargar el resumen. Pulsa Actualizar para reintentar.</p>}
    {query.data && <>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="mc-card p-4">
            <dt className="text-sm font-medium text-muted">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <h3 className="border-b border-line px-4 py-3 font-semibold sm:px-5">{showAll ? 'Todos los registros' : panel.activity}</h3>
          {sorted.length === 0
            ? <p className="p-4 text-sm text-muted sm:px-5">Aún no hay registros para este perfil.</p>
            : <ul className="divide-y divide-line">
              {(showAll ? sorted : sorted.slice(0, 5)).map((incident) => (
                <li key={incident.id}>
                  <Link to={`/incidentes/${incident.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 sm:px-5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{incident.title}</p>
                      <p className="mt-1 text-xs text-muted"><span className="font-medium text-accent">{incident.id}</span> · {dateFormat.format(new Date(incident.createdAt))}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={incident.priority} />
                      <StatusBadge status={incident.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>}
          {sorted.length > 5 && <div className="border-t border-line p-3 sm:px-5">
            <button type="button" className="mc-button mc-button-secondary mc-button-compact" aria-expanded={showAll} onClick={() => setShowAll((previous) => !previous)}>
              {showAll ? 'Mostrar solo los recientes' : `Ver todos los registros (${sorted.length})`}
            </button>
          </div>}
        </Card>
        <Card>
          <h3 className="border-b border-line px-4 py-3 font-semibold sm:px-5">{panel.groups}</h3>
          {distribution.length === 0
            ? <p className="p-4 text-sm text-muted sm:px-5">No hay casos abiertos.</p>
            : <dl className="divide-y divide-line">
                {distribution.map(([label, count]) => (
                  <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm sm:px-5" key={label}>
                    <dt className="min-w-0 break-words">{label}</dt>
                    <dd className="rounded-md bg-cyan-50 px-2 py-0.5 font-semibold tabular-nums text-accent">{count}</dd>
                  </div>
                ))}
              </dl>}
        </Card>
      </div>
    </>}
  </section>
}
