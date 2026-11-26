import { CheckCircle2, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card, Field, PageTitle, SelectInput } from '../../shared/components'
import { getEquipmentOptions, getLocations, getSymptoms } from '../../referencias-operativas/api/readContract'
import { useIncidents } from '../context/IncidentContext'

export default function ReportPage() {
  const { registerEquipmentIncident } = useIncidents()
  const [equipmentId, setEquipmentId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [symptom, setSymptom] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [createdId, setCreatedId] = useState('')
  const equipmentOptions = getEquipmentOptions()
  const locations = getLocations()
  const symptoms = getSymptoms()
  function submit(event: FormEvent) {
    event.preventDefault()
    const result = registerEquipmentIncident({ equipmentId, locationId, symptom })
    if (result.incident) { setErrors([]); setCreatedId(result.incident.id) }
    else setErrors(result.missing ?? ['Revisa los datos ingresados.'])
  }
  return <>
    <PageTitle title="Reporte rápido de falla" description="Registra una falla de equipo médico para que el área responsable la reciba." />
    {createdId && <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><div className="text-sm"><div className="font-semibold">Reporte registrado correctamente</div><p className="mt-1">Tu número de incidencia es <Link className="font-bold underline" to={`/incidentes/${createdId}`}>{createdId}</Link>.</p></div></div>}
    <Card className="mx-auto max-w-3xl p-5 sm:p-8"><div className="mb-7 border-b border-line pb-5"><p className="text-xs font-semibold uppercase tracking-wider text-brand">HU-CM1 · Enfermería asistencial</p><h2 className="mt-2 text-xl font-bold">Cuéntanos qué equipo presenta la falla</h2><p className="mt-1 text-sm text-muted">Selecciona los datos obligatorios para registrar la incidencia.</p></div>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field label="Ubicación / piso" error={errors.includes('ubicación') ? 'Selecciona la ubicación donde se encuentra el equipo.' : undefined}><SelectInput value={locationId} onChange={(event) => setLocationId(event.target.value)}><option value="">Selecciona una ubicación</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectInput></Field>
        <Field label="Equipo médico" error={errors.includes('equipo') ? 'Selecciona el equipo afectado.' : undefined}><SelectInput value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)}><option value="">Selecciona un equipo</option>{equipmentOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</SelectInput></Field>
        <Field label="Síntoma observado" error={errors.includes('síntoma') ? 'Selecciona el síntoma observado.' : undefined}><SelectInput value={symptom} onChange={(event) => setSymptom(event.target.value)}><option value="">Selecciona un síntoma</option>{symptoms.map((item) => <option key={item}>{item}</option>)}</SelectInput></Field>
        {errors.includes('opciones válidas') && <p className="text-sm text-red-600">Los datos seleccionados ya no están disponibles. Vuelve a elegir las opciones.</p>}
        <div className="flex justify-end border-t border-line pt-5"><button className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"><Send size={16} /> Enviar reporte</button></div>
      </form>
    </Card>
  </>
}
