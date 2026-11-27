import { ArrowLeft, CheckCircle2, Clock3, MapPin, Monitor, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, PageTitle, PriorityBadge, StatusBadge } from '../../shared/components'
import { demoApi, DemoApiError } from '../../shared/api/demoApi'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import type { Incident, UserRole } from '../../shared/types'
import { equipmentIncidentsPath } from '../api/equipmentIncidents'
import { generalServicesIncidentsPath } from '../api/generalServicesIncidents'
import { acknowledgeITAlert, itAlertsPath } from '../api/itAlerts'
import { useIncidents } from '../context/IncidentContext'

export default function IncidentDetailPage() {
  const { id = '' } = useParams()
  const { state } = useIncidents()
  const role = state.activeRole
  const equipmentReport = id.startsWith('INC-EQ-')
  const itAlert = id.startsWith('INC-TI-')
  const generalServices = /^INC-\d{4}-\d{4,10}$/.test(id)
  const canRequest = itAlert ? role === 'admissions' || role === 'it-support'
    : equipmentReport ? role === 'nursing' || role === 'biomedical' : role === 'general-services'
  const endpoint = itAlert ? itAlertsPath : equipmentReport ? equipmentIncidentsPath : generalServicesIncidentsPath
  const path = (equipmentReport || itAlert || generalServices) && canRequest
    ? `${endpoint}/${encodeURIComponent(id)}` : null
  const { data, error, loading } = useDemoQuery<Incident>(role, path)
  if (loading) return <p role="status">Cargando incidente…</p>
  if ((equipmentReport || itAlert || generalServices) && (!canRequest || (error instanceof DemoApiError && error.status === 403))) {
    return <p role="alert">No tienes acceso a este incidente.</p>
  }
  if (error && !(error instanceof DemoApiError && error.status === 404)) {
    return <p role="alert">No se pudo consultar el incidente. Recarga la página para reintentar.</p>
  }
  const incident = data
  if (!incident) return <Card className="p-8 text-center"><h1 className="text-xl font-semibold">Incidente no encontrado</h1><Link className="mt-4 inline-block text-accent" to="/bandeja">Volver a la bandeja</Link></Card>
  return <IncidentView key={`${role}:${id}`} initial={incident} role={role} endpoint={endpoint} />
}

function IncidentView({ initial, role, endpoint }: { initial: Incident; role: UserRole; endpoint: string }) {
  const [updated, setUpdated] = useState<Incident>()
  const [pending, setPending] = useState<'acknowledge' | 'resolve' | null>(null)
  const [actionError, setActionError] = useState('')
  const incident = updated ?? initial
  const isAlert = incident.kind === 'alerta-ti'
  const responsibleRole = isAlert ? 'it-support' : incident.kind === 'equipo-medico' ? 'biomedical' : 'general-services'
  const canResolve = role === responsibleRole && incident.open !== false
  const backPath = role === 'admissions' ? '/alerta-ti' : role === 'nursing' ? '/reportar-falla' : '/bandeja'

  async function applyAction(action: 'acknowledge' | 'resolve') {
    if (pending) return
    setActionError('')
    setPending(action)
    try {
      const result = action === 'resolve'
        ? await demoApi<Incident>(role, `${endpoint}/${encodeURIComponent(incident.id)}/resolucion`, { method: 'PUT' })
        : await acknowledgeITAlert(incident.id)
      setUpdated(result)
    } catch {
      setActionError(action === 'resolve' ? 'No se pudo resolver el incidente. Inténtalo de nuevo.' : 'No se pudo confirmar la recepción. Inténtalo de nuevo.')
    } finally {
      setPending(null)
    }
  }

  return <>
    <Link to={backPath} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"><ArrowLeft size={16} />Volver a la bandeja</Link>
    <PageTitle title={incident.title} description={`Registrado ${new Date(incident.createdAt).toLocaleString('es-PE')} por ${incident.reportedBy}`} action={<div className="flex items-center gap-2"><PriorityBadge priority={incident.priority} /><StatusBadge status={incident.status} /></div>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
      <div className="space-y-5"><Card className="p-5 sm:p-6"><h2 className="border-b border-line pb-3 font-semibold">Información del reporte</h2><dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2"><div className="sm:col-span-2"><dt className="text-xs text-muted">Descripción</dt><dd className="mt-1 text-sm leading-6">{incident.description}</dd></div><div><dt className="text-xs text-muted">ID del incidente</dt><dd className="mt-1 font-mono text-sm">{incident.id}</dd></div><div><dt className="text-xs text-muted">Área responsable</dt><dd className="mt-1 text-sm">{incident.area}</dd></div><div><dt className="text-xs text-muted">Síntoma reportado</dt><dd className="mt-1 text-sm">{incident.symptom ?? 'No especificado'}</dd></div><div><dt className="text-xs text-muted">Ubicación exacta</dt><dd className="mt-1 flex items-center gap-1.5 text-sm"><MapPin size={15} className="text-accent" />{incident.location}</dd></div>{incident.stationId && <><div><dt className="text-xs text-muted">Estación</dt><dd className="mt-1 text-sm">{incident.stationId}</dd></div>{incident.ip && <div><dt className="text-xs text-muted">Dirección IP</dt><dd className="mt-1 font-mono text-sm">{incident.ip}</dd></div>}</>}{incident.incidentType && <div><dt className="text-xs text-muted">{incident.kind === 'tecnico' ? 'Tipo de problema' : 'Tipo de falla'}</dt><dd className="mt-1 text-sm">{incident.incidentType}</dd></div>}</dl></Card>
        {role === 'biomedical' && incident.equipmentId && <Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-accent"><Stethoscope size={20} /></div><div><h2 className="font-semibold">Equipo asociado</h2><p className="mt-1 text-xs text-muted">Consulta sus datos técnicos e historial de mantenimiento.</p></div></div><Link to={`/equipos/${incident.equipmentId}`} className="mt-5 mc-button mc-button-secondary">Abrir ficha técnica</Link></Card>}</div>
      <Card className="h-fit p-5 sm:p-6"><h2 className="border-b border-line pb-3 font-semibold">Recepción</h2><div className="mt-5 flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-100 text-accent">{isAlert ? <Monitor size={17} /> : <Clock3 size={17} />}</div><div><div className="text-sm font-semibold">{isAlert ? 'Soporte de TI' : 'Área responsable'}</div><p className="mt-1 text-xs leading-5 text-muted">{isAlert ? 'Confirma que el equipo de TI recibió la alerta prioritaria.' : 'Este reporte está disponible para su área responsable.'}</p></div></div>
        {isAlert && role === 'it-support' && incident.open && <button type="button" disabled={pending !== null || Boolean(incident.acknowledgedAt)} onClick={() => void applyAction('acknowledge')} className="mt-5 mc-button mc-button-primary w-full"><CheckCircle2 size={17} />{incident.acknowledgedAt ? 'Recepción confirmada' : 'Confirmar recepción'}</button>}
        {canResolve && (
          <button type="button" disabled={pending !== null} onClick={() => void applyAction('resolve')} className="mt-3 mc-button mc-button-secondary w-full">
            <CheckCircle2 size={17} />{pending === 'resolve' ? 'Resolviendo…' : 'Marcar como resuelto'}
          </button>
        )}
        {actionError && <p role="alert" className="mt-3 text-sm text-red-600">{actionError}</p>}
        {incident.resolvedAt && <p className="mt-3 text-sm text-muted">Resuelto el {new Date(incident.resolvedAt).toLocaleString('es-PE')}</p>}
        {isAlert && incident.open && <p className="mt-3 text-xs text-muted">El incidente sigue abierto.</p>}
        {incident.acknowledgedAt && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800"><span className="font-semibold">Acuse registrado</span><br />{new Date(incident.acknowledgedAt).toLocaleString('es-PE')}</div>}
        <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-muted"><span className="font-semibold text-ink">Prioridad inicial:</span> {isAlert ? 'Crítica, asignada por regla de dominio para alertas de TI.' : incident.priority}</div>
      </Card>
    </div>
  </>
}
