import { ArrowRight, ClipboardList, PlusCircle, RefreshCw, Siren, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageTitle, PriorityBadge, StatusBadge } from '../../shared/components'
import { roleLabels, type Incident, type UserRole } from '../../shared/types'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import { equipmentIncidentsPath } from '../api/equipmentIncidents'
import { generalServicesIncidentsPath, type GeneralServicesFloorGroup } from '../api/generalServicesIncidents'
import { itAlertsPath, supportAlertsPath } from '../api/itAlerts'
import { useIncidents } from '../context/IncidentContext'

const inboxPaths: Record<Exclude<UserRole, 'nursing'>, string> = {
  admissions: itAlertsPath,
  biomedical: equipmentIncidentsPath,
  'it-support': supportAlertsPath,
  'general-services': `${generalServicesIncidentsPath}?incluirResueltos=1`,
}

const dateFormat = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima',
})

export default function HomePage() {
  const role = useIncidents().state.activeRole
  const profile = roleLabels[role]
  const shortcuts = role === 'nursing'
    ? [{ title: 'Reportar falla en equipo médico', text: 'Registra el equipo, la ubicación y el síntoma observado.', to: '/reportar-falla', Icon: PlusCircle }]
    : role === 'admissions'
      ? [{ title: 'Enviar alerta rápida a TI', text: 'Notifica un bloqueo de estación con su ubicación e IP.', to: '/alerta-ti', Icon: Siren }]
      : [
          { title: role === 'biomedical' ? 'Abrir bandeja biomédica' : 'Consultar bandeja de incidentes', text: 'Revisa los casos de tu área y abre su detalle.', to: '/bandeja', Icon: ClipboardList },
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
    {role !== 'nursing' && <IncidentOverview key={role} role={role} />}
  </>
}

function IncidentOverview({ role }: { role: Exclude<UserRole, 'nursing'> }) {
  const [revision, setRevision] = useState(0)
  const query = useDemoQuery<Incident[] | GeneralServicesFloorGroup[]>(role, inboxPaths[role], revision)
  const incidents = role === 'general-services'
    ? (query.data as GeneralServicesFloorGroup[] | null)?.flatMap(({ incidents }) => incidents) ?? []
    : (query.data as Incident[] | null) ?? []
  const open = incidents.filter((incident) => incident.open !== false)
  const recent = [...incidents].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  const metrics = [
    { label: role === 'admissions' ? 'Alertas enviadas' : 'Incidencias registradas', value: incidents.length },
    { label: 'Abiertas', value: open.length },
    { label: 'Críticas abiertas', value: open.filter(({ priority }) => priority === 'Crítica').length },
    { label: 'Resueltas', value: incidents.length - open.length },
  ]

  return <section aria-labelledby="summary-title" aria-busy={query.loading}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 id="summary-title" className="text-lg font-semibold">Resumen de incidencias</h2>
      <button type="button" className="mc-button mc-button-secondary mc-button-compact" onClick={() => setRevision((previous) => previous + 1)} disabled={query.loading}>
        <RefreshCw size={15} aria-hidden="true" /> Actualizar
      </button>
    </div>
    {query.loading && <p role="status" className="text-sm text-muted">Cargando el resumen…</p>}
    {query.error && <p role="alert" className="text-sm text-red-600">No se pudo cargar el resumen. Pulsa Actualizar para reintentar.</p>}
    {query.data && <>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value }) => (
          <div key={label} className="mc-card p-4">
            <dt className="text-sm font-medium text-muted">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <Card className="mt-5">
        <h3 className="border-b border-line px-4 py-3 font-semibold sm:px-5">Actividad reciente</h3>
        {recent.length === 0
          ? <p className="p-4 text-sm text-muted sm:px-5">Aún no hay incidencias para este perfil.</p>
          : <ul className="divide-y divide-line">
            {recent.map((incident) => (
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
      </Card>
    </>}
  </section>
}
