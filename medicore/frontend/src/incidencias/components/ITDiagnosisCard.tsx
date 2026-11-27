import { useState, type FormEvent } from 'react'
import { Card, Field, SelectInput } from '../../shared/components'
import { DemoApiError } from '../../shared/api/demoApi'
import type { Incident } from '../../shared/types'
import { recordITDiagnosis } from '../api/itAlerts'

export function ITDiagnosisCard({ incident, canEdit, blocked, onSaving, onSaved }: {
  incident: Incident
  canEdit: boolean
  blocked: boolean
  onSaving: (saving: boolean) => void
  onSaved: (incident: Incident) => void
}) {
  const diagnosis = incident.diagnosis
  const [result, setResult] = useState(diagnosis ? String(diagnosis.responded) : '')
  const [summary, setSummary] = useState(diagnosis?.summary ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || blocked) return
    setError('')
    setSaved(false)
    if (!result || !summary.trim()) {
      setError('Selecciona el resultado y describe la comprobación.')
      return
    }
    setSaving(true)
    onSaving(true)
    try {
      onSaved(await recordITDiagnosis(incident.id, { responded: result === 'true', summary: summary.trim() }))
      setSaved(true)
    } catch (failure) {
      setError(failure instanceof DemoApiError ? failure.message : 'No se pudo guardar el diagnóstico. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
      onSaving(false)
    }
  }

  return <Card className="p-5 sm:p-6">
    <h2 className="border-b border-line pb-3 font-semibold">Diagnóstico remoto de TI</h2>
    {diagnosis && <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
      <p className="font-semibold">{diagnosis.responded ? 'La estación respondió' : 'La estación no respondió'}</p>
      <p className="mt-1 whitespace-pre-wrap break-words">{diagnosis.summary}</p>
      {!diagnosis.responded && <p className="mt-2 font-semibold text-accent">Siguiente acción: revisión presencial.</p>}
    </div>}
    {canEdit && <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-4">
      <Field label="Resultado de la estación">
        <SelectInput required value={result} onChange={(event) => setResult(event.target.value)}>
          <option value="">Selecciona un resultado</option>
          <option value="true">Respondió</option>
          <option value="false">No respondió</option>
        </SelectInput>
      </Field>
      <Field label="Resultado de las comprobaciones">
        <textarea className="mc-control" rows={3} maxLength={500} required value={summary} onChange={(event) => setSummary(event.target.value)} />
      </Field>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {saved && <p role="status" className="text-sm text-emerald-700">Diagnóstico guardado.</p>}
      <button type="submit" className="mc-button mc-button-primary" disabled={saving || blocked}>{saving ? 'Guardando…' : 'Guardar diagnóstico'}</button>
    </form>}
  </Card>
}
