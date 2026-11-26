import { CheckCircle2, MapPin, Send, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card, Field, PageTitle, SelectInput } from '../../shared/components'
import { getStations } from '../../referencias-operativas/api/readContract'
import { useIncidents } from '../context/IncidentContext'

export default function AlertPage() {
  const { sendITAlert } = useIncidents()
  const [stationId, setStationId] = useState('ADM-01')
  const [errors, setErrors] = useState<string[]>([])
  const [createdId, setCreatedId] = useState('')
  const stations = getStations()
  const station = stations.find((item) => item.id === stationId)
  function submit(event: FormEvent) {
    event.preventDefault()
    const result = sendITAlert(stationId)
    if (result.incident) { setErrors([]); setCreatedId(result.incident.id) }
    else setErrors(result.missing ?? ['No se pudo enviar la alerta.'])
  }
  return <>
    <PageTitle title="Alerta rápida a TI" description="Notifica a soporte cuando una estación de Admisión se bloquee." />
    {createdId && <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><div className="text-sm"><div className="font-semibold">Alerta enviada correctamente</div><p className="mt-1">El ticket <Link className="font-bold underline" to={`/incidentes/${createdId}`}>{createdId}</Link> ya aparece en la bandeja de TI.</p></div></div>}
    <Card className="mx-auto max-w-3xl overflow-hidden"><div className="bg-[#e93649] px-6 py-7 text-white sm:px-10"><div className="mx-auto flex max-w-xl items-center gap-5"><TriangleAlert size={56} className="shrink-0" /><div><p className="text-xl font-bold">Reportar caída de sistema</p><p className="mt-1 text-sm text-white/90">Envía la ubicación de la estación y solicita soporte de TI.</p></div></div></div>
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">HU-JR1 · Encargado de Admisión</p>
        <Field label="Estación bloqueada" error={errors.length ? `Falta: ${errors.join(' e ')}.` : undefined}><SelectInput value={stationId} onChange={(event) => { setStationId(event.target.value); setErrors([]) }}>{stations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectInput></Field>
        <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold"><MapPin size={17} className="text-brand" /> Ubicación actual</div><p className="mt-1 text-sm text-muted">{station?.location || 'No registrada'}</p></div><div className="rounded-lg bg-slate-50 p-4"><div className="text-sm font-semibold">IP registrada</div><p className="mt-1 text-sm text-muted">{station?.ip || 'No registrada'}</p></div></div>
        <p className="text-xs text-muted">La alerta se crea con prioridad crítica y solo si la estación tiene ubicación e IP configuradas.</p>
        <div className="flex justify-end border-t border-line pt-5"><button className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"><Send size={16} /> Enviar alerta</button></div>
      </form>
    </Card>
  </>
}
