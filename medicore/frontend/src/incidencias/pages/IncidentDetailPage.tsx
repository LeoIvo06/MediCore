import { ArrowLeft, CheckCircle2, Clock3, MapPin, Monitor, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, PageTitle, PriorityBadge, StatusBadge } from '../../shared/components'
import { demoApi, DemoApiError } from '../../shared/api/demoApi'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import type { Incident, UserRole } from '../../shared/types'
import { acknowledgeITAlert } from '../api/itAlerts'
import { IncidentTimeline } from '../components/IncidentTimeline'
import { ITDiagnosisCard } from '../components/ITDiagnosisCard'
import { useIncidents } from '../context/IncidentContext'
import { getIncidentDetailRoute } from '../utils/incidentDetailRoute'

export default function IncidentDetailPage() {
  const { id = '' } = useParams()
  const { state } = useIncidents()
  const role = state.activeRole
  const route = getIncidentDetailRoute(id)
  const path = route?.roles.includes(role) ? `${route.endpoint}/${encodeURIComponent(id)}` : null
  const { data, error, loading } = useDemoQuery<Incident>(role, path)
  if (loading) return <p role="status">Cargando incidente…</p>
  if (route && (!path || (error instanceof DemoApiError && error.status === 403))) {
    return <IncidentUnavailable role={role} title="No tienes acceso a este incidente" />
  }
  if (error && !(error instanceof DemoApiError && error.status === 404)) {
    return <p role="alert">No se pudo consultar el incidente. Recarga la página para reintentar.</p>
  }
  if (!data || !route) return <IncidentUnavailable role={role} title="Incidente no encontrado" />
  return <IncidentView key={`${role}:${id}`} initial={data} role={role} endpoint={route.endpoint} />
}

function IncidentUnavailable({ role, title }: { role: UserRole; title: string }) {
  return <Card className="p-5 sm:p-6">
    <PageTitle title={title} />
    <IncidentBackLink role={role} />
  </Card>
}

function IncidentBackLink({ role }: { role: UserRole }) {
  const backPath = role === 'admissions' ? '/alerta-ti' : role === 'nursing' ? '/' : '/bandeja'
  const backLabel = role === 'nursing' ? 'Volver a mis reportes' : role === 'admissions' ? 'Volver a mis alertas' : 'Volver a la bandeja'
  return <Link to={backPath} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline">
    <ArrowLeft size={16} aria-hidden="true" />{backLabel}
  </Link>
}

function IncidentView({ initial, role, endpoint }: { initial: Incident; role: UserRole; endpoint: string }) {
  const [updated, setUpdated] = useState<Incident>()
  const [pending, setPending] = useState<'acknowledge' | 'resolve' | null>(null)
  const [actionError, setActionError] = useState('')
  const [savingDiagnosis, setSavingDiagnosis] = useState(false)
  const incident = updated ?? initial
  const isAlert = incident.kind === 'alerta-ti'
  const responsibleRole = isAlert ? 'it-support' : incident.kind === 'equipo-medico' ? 'biomedical' : 'general-services'
  const canResolve = role === responsibleRole && incident.open !== false

  async function applyAction(action: 'acknowledge' | 'resolve') {
    if (pending || savingDiagnosis) return
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
    <div className="mb-3"><IncidentBackLink role={role} /></div>
    <PageTitle title={incident.title} action={<div className="flex items-center gap-2"><PriorityBadge priority={incident.priority} /><StatusBadge status={incident.status} /></div>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
      <div className="space-y-5"><Card className="p-5 sm:p-6"><h2 className="border-b border-line pb-3 font-semibold">Información del reporte</h2><dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2"><div className="sm:col-span-2"><dt className="text-xs text-muted">Descripción</dt><dd className="mt-1 text-sm leading-6">{incident.description}</dd></div><div><dt className="text-xs text-muted">ID del incidente</dt><dd className="mt-1 font-mono text-sm">{incident.id}</dd></div><div><dt className="text-xs text-muted">Área responsable</dt><dd className="mt-1 text-sm">{incident.area}</dd></div><div><dt className="text-xs text-muted">Síntoma reportado</dt><dd className="mt-1 text-sm">{incident.symptom ?? 'No especificado'}</dd></div><div><dt className="text-xs text-muted">Ubicación exacta</dt><dd className="mt-1 flex items-center gap-1.5 text-sm"><MapPin size={15} className="text-accent" />{incident.location}</dd></div>{incident.stationId && <div><dt className="text-xs text-muted">Estación</dt><dd className="mt-1 text-sm">{incident.stationId}</dd></div>}{isAlert && <div><dt className="text-xs text-muted">Dirección IP</dt><dd className="mt-1 text-sm">{incident.ip ? <span className="font-mono">{incident.ip}</span> : 'IP no disponible'}</dd></div>}{incident.incidentType && <div><dt className="text-xs text-muted">{incident.kind === 'tecnico' ? 'Tipo de problema' : 'Tipo de falla'}</dt><dd className="mt-1 text-sm">{incident.incidentType}</dd></div>}</dl></Card>
        <IncidentTimeline incident={incident} />
        {isAlert && (incident.diagnosis || (role === 'it-support' && incident.open && incident.stationId)) && (
          <ITDiagnosisCard incident={incident} canEdit={role === 'it-support' && Boolean(incident.open && incident.stationId)}
            blocked={pending !== null} onSaving={setSavingDiagnosis} onSaved={setUpdated} />
        )}
        {role === 'biomedical' && incident.equipmentId && <Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-accent"><Stethoscope size={20} /></div><div><h2 className="font-semibold">Equipo asociado</h2><p className="mt-1 text-xs text-muted">Consulta sus datos técnicos e historial de mantenimiento.</p></div></div><Link to={`/equipos/${incident.equipmentId}`} className="mt-5 mc-button mc-button-secondary">Abrir ficha técnica</Link></Card>}</div>
      <Card className="h-fit p-5 sm:p-6"><h2 className="border-b border-line pb-3 font-semibold">Recepción</h2><div className="mt-5 flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-100 text-accent">{isAlert ? <Monitor size={17} /> : <Clock3 size={17} />}</div><div><div className="text-sm font-semibold">{isAlert ? 'Soporte de TI' : 'Área responsable'}</div><p className="mt-1 text-xs leading-5 text-muted">{isAlert ? 'Confirma que el equipo de TI recibió la alerta prioritaria.' : 'Este reporte está disponible para su área responsable.'}</p></div></div>
        {isAlert && role === 'it-support' && incident.open && <button type="button" disabled={savingDiagnosis || pending !== null || Boolean(incident.acknowledgedAt)} onClick={() => void applyAction('acknowledge')} className="mt-5 mc-button mc-button-primary w-full"><CheckCircle2 size={17} />{incident.acknowledgedAt ? 'Recepción confirmada' : 'Confirmar recepción'}</button>}
        {canResolve && (
          <button type="button" disabled={savingDiagnosis || pending !== null} onClick={() => void applyAction('resolve')} className="mt-3 mc-button mc-button-secondary w-full">
            <CheckCircle2 size={17} />{pending === 'resolve' ? 'Resolviendo…' : 'Marcar como resuelto'}
          </button>
        )}
        {actionError && <p role="alert" className="mt-3 text-sm text-red-600">{actionError}</p>}
        {isAlert && incident.open && <p className="mt-3 text-xs text-muted">El incidente sigue abierto.</p>}
        <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-muted"><span className="font-semibold text-ink">Prioridad inicial:</span> {isAlert ? 'Crítica, asignada por regla de dominio para alertas de TI.' : incident.priority}</div>
      </Card>
    </div>
  </>
}
