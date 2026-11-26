import { ArrowLeft, CheckCircle2, Clock3, MapPin, Monitor, Stethoscope } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Card, PageTitle, PriorityBadge, StatusBadge } from '../../shared/components'
import { roleLabels } from '../../shared/types'
import { useIncidents } from '../context/IncidentContext'

export default function IncidentDetailPage() {
  const { id = '' } = useParams()
  const { state, confirmAlert } = useIncidents()
  const incident = state.incidents.find((item) => item.id === id)
  if (!incident) return <Card className="p-8 text-center"><h1 className="text-xl font-semibold">Incidente no encontrado</h1><Link className="mt-4 inline-block text-brand" to="/bandeja">Volver a la bandeja</Link></Card>
  const role = state.activeRole
  const allowed = role === 'it-support' ? incident.area === 'TI' : role === 'biomedical' ? incident.area === 'Biomédica' : role === 'general-services' ? incident.area === 'Servicios Generales' : role === 'nursing' ? incident.reportedBy === roleLabels.nursing.name : incident.reportedBy === roleLabels.admissions.name
  if (!allowed) return <Card className="p-8 text-center"><h1 className="text-xl font-semibold">No tienes acceso a este incidente</h1><p className="mt-2 text-sm text-muted">El detalle está limitado al área responsable o al reportante.</p><Link className="mt-4 inline-block text-brand" to="/bandeja">Volver</Link></Card>
  const isAlert = incident.kind === 'alerta-ti'
  return <>
    <Link to="/bandeja" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"><ArrowLeft size={16} />Volver a la bandeja</Link>
    <PageTitle title={incident.title} description={`Registrado ${new Date(incident.createdAt).toLocaleString('es-PE')} por ${incident.reportedBy}`} action={<div className="flex items-center gap-2"><PriorityBadge priority={incident.priority} /><StatusBadge status={incident.status} /></div>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
      <div className="space-y-5"><Card className="p-5 sm:p-6"><h2 className="border-b border-line pb-3 font-semibold">Información del reporte</h2><dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2"><div className="sm:col-span-2"><dt className="text-xs text-muted">Descripción</dt><dd className="mt-1 text-sm leading-6">{incident.description}</dd></div><div><dt className="text-xs text-muted">ID del incidente</dt><dd className="mt-1 font-mono text-sm">{incident.id}</dd></div><div><dt className="text-xs text-muted">Área responsable</dt><dd className="mt-1 text-sm">{incident.area}</dd></div><div><dt className="text-xs text-muted">Síntoma reportado</dt><dd className="mt-1 text-sm">{incident.symptom ?? 'No especificado'}</dd></div><div><dt className="text-xs text-muted">Ubicación exacta</dt><dd className="mt-1 flex items-center gap-1.5 text-sm"><MapPin size={15} className="text-brand" />{incident.location}</dd></div>{incident.stationId && <><div><dt className="text-xs text-muted">Estación</dt><dd className="mt-1 text-sm">{incident.stationId}</dd></div><div><dt className="text-xs text-muted">Dirección IP</dt><dd className="mt-1 font-mono text-sm">{incident.ip}</dd></div></>}</dl></Card>
        {incident.equipmentId && <Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-brand"><Stethoscope size={20} /></div><div><h2 className="font-semibold">Equipo asociado</h2><p className="mt-1 text-xs text-muted">Consulta sus datos técnicos e historial de mantenimiento.</p></div></div><Link to={`/equipos/${incident.equipmentId}`} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Abrir ficha técnica</Link></Card>}</div>
      <Card className="h-fit p-5 sm:p-6"><h2 className="border-b border-line pb-3 font-semibold">Recepción</h2><div className="mt-5 flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-100 text-brand">{isAlert ? <Monitor size={17} /> : <Clock3 size={17} />}</div><div><div className="text-sm font-semibold">{isAlert ? 'Soporte de TI' : 'Área responsable'}</div><p className="mt-1 text-xs leading-5 text-muted">{isAlert ? 'Confirma que el equipo de TI recibió la alerta prioritaria.' : 'Este reporte está disponible para su área responsable.'}</p></div></div>
        {isAlert && role === 'it-support' && <button onClick={() => confirmAlert(incident.id)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"><CheckCircle2 size={17} />{incident.acknowledgedAt ? 'Recepción confirmada' : 'Confirmar recepción'}</button>}
        {incident.acknowledgedAt && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800"><span className="font-semibold">Acuse registrado</span><br />{new Date(incident.acknowledgedAt).toLocaleString('es-PE')}</div>}
        <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-muted"><span className="font-semibold text-ink">Prioridad inicial:</span> {isAlert ? 'Crítica, asignada por regla de dominio para alertas de TI.' : incident.priority}</div>
      </Card>
    </div>
  </>
}
