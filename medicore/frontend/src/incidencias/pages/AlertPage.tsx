import { CheckCircle2, MapPin, Send, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card, Field, PageTitle, SelectInput } from '../../shared/components'
import { stationRecordsPath, type StationRecord } from '../../referencias-operativas/api/stationRecords'
import { DemoApiError } from '../../shared/api/demoApi'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import type { Incident } from '../../shared/types'
import { itAlertsPath, sendITAlert } from '../api/itAlerts'
import { useIncidents } from '../context/IncidentContext'

export default function AlertPage() {
  const role = useIncidents().state.activeRole
  return role === 'admissions'
    ? <ITAlertForm />
    : <p role="alert">El envío de alertas está disponible para Admisión.</p>
}

const fieldNames: Record<string, string> = { stationId: 'estación válida', location: 'ubicación', ip: 'IP' }

function ITAlertForm() {
  const [stationId, setStationId] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [createdId, setCreatedId] = useState('')
  const [revision, setRevision] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { data: stations, loading, error } = useDemoQuery<StationRecord[]>('admissions', stationRecordsPath)
  const history = useDemoQuery<Incident[]>('admissions', itAlertsPath, revision)
  const chosenId = stationId || stations?.[0]?.id || ''
  const station = stations?.find((item) => item.id === chosenId)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting || !chosenId || !stations) return
    setCreatedId('')
    setErrors([])
    setSubmitError('')
    setSubmitting(true)
    try {
      const alert = await sendITAlert(chosenId)
      setCreatedId(alert.id)
      setRevision((previous) => previous + 1)
    } catch (error) {
      if (error instanceof DemoApiError && error.status === 422) setErrors(error.fields)
      else setSubmitError('No se pudo enviar la alerta. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }
  return <>
    <PageTitle title="Alerta rápida a TI" description="Notifica a soporte cuando una estación de Admisión se bloquee." />
    {loading && <p role="status">Cargando las estaciones…</p>}
    {error && <p role="alert">No se pudieron cargar las estaciones. Recarga la página para reintentar.</p>}
    {submitError && <p role="alert" className="mb-4 text-red-600">{submitError}</p>}
    {createdId && <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><div className="text-sm"><div className="font-semibold">Alerta enviada correctamente</div><p className="mt-1">El ticket <Link className="font-bold underline" to={`/incidentes/${createdId}`}>{createdId}</Link> ya aparece en la bandeja de TI.</p></div></div>}
    <Card className="mx-auto max-w-3xl overflow-hidden"><div className="bg-[#e93649] px-6 py-7 text-white sm:px-10"><div className="mx-auto flex max-w-xl items-center gap-5"><TriangleAlert size={56} className="shrink-0" /><div><p className="text-xl font-bold">Reportar caída de sistema</p><p className="mt-1 text-sm text-white/90">Envía la ubicación de la estación y solicita soporte de TI.</p></div></div></div>
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">HU-JR1 · Encargado de Admisión</p>
        <Field label="Estación bloqueada" error={errors.length ? `Falta: ${errors.map((field) => fieldNames[field]).join(' e ')}.` : undefined}><SelectInput disabled={submitting || !stations?.length} value={chosenId} onChange={(event) => { setStationId(event.target.value); setErrors([]) }}>{stations?.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectInput></Field>
        <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold"><MapPin size={17} className="text-accent" /> Ubicación actual</div><p className="mt-1 text-sm text-muted">{station?.location || 'No registrada'}</p></div><div className="rounded-lg bg-slate-50 p-4"><div className="text-sm font-semibold">IP registrada</div><p className="mt-1 text-sm text-muted">{station?.ip || 'No registrada'}</p></div></div>
        <p className="text-xs text-muted">La alerta se crea con prioridad crítica y solo si la estación tiene ubicación e IP configuradas.</p>
        <div className="flex justify-end border-t border-line pt-5"><button disabled={submitting || !chosenId} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"><Send size={16} /> {submitting ? 'Enviando…' : 'Enviar alerta'}</button></div>
      </form>
    </Card>
    <Card className="mx-auto mt-5 max-w-3xl p-5">
      <h2 className="font-semibold">Alertas enviadas</h2>
      {history.loading && <p role="status" className="mt-2 text-sm">Cargando alertas…</p>}
      {history.error && <p role="alert" className="mt-2 text-sm">No se pudieron cargar tus alertas.</p>}
      {history.data?.length === 0 && <p className="mt-2 text-sm text-muted">Aún no has enviado alertas.</p>}
      {history.data?.map((alert) => <div key={alert.id} className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
        <Link className="font-semibold text-accent hover:underline" to={`/incidentes/${alert.id}`}>{alert.id} · {alert.stationId}</Link>
        <span className="text-muted">{alert.acknowledgedAt ? 'Recepción confirmada' : 'Pendiente de acuse'}</span>
      </div>)}
    </Card>
  </>
}
