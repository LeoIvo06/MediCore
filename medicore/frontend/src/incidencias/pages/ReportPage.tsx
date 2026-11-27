import { CheckCircle2, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card, Field, PageTitle, SelectInput } from '../../shared/components'
import { DemoApiError } from '../../shared/api/demoApi'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import { registerEquipmentIncident, reportOptionsPath, type ReportOptions } from '../api/equipmentIncidents'
import { useIncidents } from '../context/IncidentContext'

export default function ReportPage() {
  const { state } = useIncidents()
  const allowed = state.activeRole === 'nursing'
  return allowed ? <EquipmentReportForm /> : <p role="alert">El reporte está disponible para Enfermería.</p>
}

function EquipmentReportForm() {
  const { data: options, loading, error } = useDemoQuery<ReportOptions>('nursing', reportOptionsPath)
  const [equipmentId, setEquipmentId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [symptom, setSymptom] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [createdId, setCreatedId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting || !options) return
    setCreatedId('')
    setErrors([])
    setSubmitError('')
    setSubmitting(true)
    try {
      const incident = await registerEquipmentIncident({ equipmentId, locationId, symptomId: symptom })
      setCreatedId(incident.id)
      setEquipmentId('')
      setLocationId('')
      setSymptom('')
    } catch (error) {
      if (error instanceof DemoApiError && error.status === 422) setErrors(error.fields)
      else setSubmitError('No se pudo registrar el reporte. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }
  return <>
    <PageTitle title="Reporte rápido de falla" description="Registra una falla de equipo médico para que el área responsable la reciba." />
    {loading && <p role="status">Cargando opciones del reporte…</p>}
    {error && <p role="alert">No se pudieron cargar las opciones. Recarga la página para reintentar.</p>}
    {submitError && <p role="alert" className="mb-4 text-red-600">{submitError}</p>}
    {createdId && <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><div className="text-sm"><div className="font-semibold">Reporte registrado correctamente</div><p className="mt-1">Tu número de incidencia es <Link className="font-bold underline" to={`/incidentes/${createdId}`}>{createdId}</Link>.</p></div></div>}
    <Card className="mx-auto max-w-3xl p-5 sm:p-8"><div className="mb-7 border-b border-line pb-5"><p className="text-xs font-semibold uppercase tracking-wider text-brand">HU-CM1 · Enfermería asistencial</p><h2 className="mt-2 text-xl font-bold">Cuéntanos qué equipo presenta la falla</h2><p className="mt-1 text-sm text-muted">Selecciona los datos obligatorios para registrar la incidencia.</p></div>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field label="Ubicación / piso" error={errors.includes('locationId') ? 'Selecciona la ubicación donde se encuentra el equipo.' : undefined}><SelectInput value={locationId} onChange={(event) => setLocationId(event.target.value)}><option value="">Selecciona una ubicación</option>{options?.locations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectInput></Field>
        <Field label="Equipo médico" error={errors.includes('equipmentId') ? 'Selecciona el equipo afectado.' : undefined}><SelectInput value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)}><option value="">Selecciona un equipo</option>{options?.equipment.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectInput></Field>
        <Field label="Síntoma observado" error={errors.includes('symptomId') ? 'Selecciona el síntoma observado.' : undefined}><SelectInput value={symptom} onChange={(event) => setSymptom(event.target.value)}><option value="">Selecciona un síntoma</option>{options?.symptoms.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectInput></Field>

        <div className="flex justify-end border-t border-line pt-5"><button disabled={submitting || !options} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"><Send size={16} /> {submitting ? 'Enviando…' : 'Enviar reporte'}</button></div>
      </form>
    </Card>
  </>
}
