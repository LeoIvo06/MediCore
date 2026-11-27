import { ArrowRight, ClipboardList, PlusCircle, Siren, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, PageTitle } from '../../shared/components'
import { roleLabels } from '../../shared/types'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import { generalServicesIncidentsPath, type GeneralServicesFloorGroup } from '../api/generalServicesIncidents'
import { useIncidents } from '../context/IncidentContext'

export default function HomePage() {
  const { state } = useIncidents()
  const role = state.activeRole
  const profile = roleLabels[role]
  const { data: groups } = useDemoQuery<GeneralServicesFloorGroup[]>(
    role, role === 'general-services' ? generalServicesIncidentsPath : null,
  )
  const recentIncidents = groups?.flatMap((group) => group.incidents)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)) ?? []
  const shortcuts = role === 'nursing'
    ? [{ title: 'Reportar falla en equipo médico', text: 'Registra el equipo, la ubicación y el síntoma observado.', to: '/reportar-falla', Icon: PlusCircle }]
    : role === 'admissions'
      ? [{ title: 'Enviar alerta rápida a TI', text: 'Notifica un bloqueo de estación con su ubicación e IP.', to: '/alerta-ti', Icon: Siren }]
      : [{ title: role === 'biomedical' ? 'Abrir bandeja biomédica' : 'Consultar bandeja de incidentes', text: 'Revisa los casos de tu área y abre su detalle.', to: '/bandeja', Icon: ClipboardList }, ...(role === 'biomedical' ? [{ title: 'Ficha técnica del equipo', text: 'Consulta datos del activo y su historial.', to: '/equipos/eq-vent-00123', Icon: Stethoscope }] : [])]
  return <>
    <PageTitle title={`Hola, ${profile.name.split(' ')[0]}`} description="¿Qué necesitas hacer en MediCore hoy?" />
    <div className="grid gap-4 md:grid-cols-2">
      {shortcuts.map(({ title, text, to, Icon }) => <Link key={to} to={to} className="group mc-card p-6 transition-colors hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg">
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-cyan-50 text-accent"><Icon size={23} /></div><h2 className="text-lg font-semibold text-ink">{title}</h2><p className="mt-1 text-sm text-muted">{text}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">Abrir <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
      </Link>)}
    </div>
    {recentIncidents.length > 0 && <Card className="mt-6 overflow-hidden"><div className="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 className="font-semibold">Actividad reciente</h2><p className="mt-1 text-xs text-muted">Incidentes activos de Servicios Generales</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-muted">{recentIncidents.length} incidentes</span></div>
      <div className="divide-y divide-line">{recentIncidents.slice(0, 4).map((incident) => <Link key={incident.id} to={`/incidentes/${incident.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"><div><div className="text-xs font-medium text-accent">{incident.id}</div><div className="mt-1 text-sm font-medium">{incident.title}</div><div className="mt-1 text-xs text-muted">{incident.location}</div></div><span className="text-xs text-muted">{incident.priority}</span></Link>)}</div>
    </Card>}
  </>
}
