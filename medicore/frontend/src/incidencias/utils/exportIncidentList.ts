import type { Incident } from '../../shared/types'

function quote(value: string | number) {
  const text = String(value)
  const safe = /^(?:[\t\r\n]|\s*[=+\-@])/.test(text) ? "'" + text : text
  return '"' + safe.replaceAll('"', '""') + '"'
}

export function exportIncidentList(incidents: readonly Incident[], includeITFields: boolean) {
  const columns = ['ID', 'Incidente', 'Descripción', 'Ubicación', 'Piso', 'Prioridad', 'Estado']
  if (includeITFields) columns.push('Estación', 'IP', 'Fecha de acuse (ISO)')

  const rows = incidents.map((incident) => {
    const cells: (string | number)[] = [
      incident.id, incident.title, incident.description, incident.location,
      incident.floor, incident.priority, incident.status,
    ]
    if (includeITFields) cells.push(incident.stationId ?? '', incident.ip ?? '', incident.acknowledgedAt ?? '')
    return cells
  })

  const text = [columns, ...rows].map((row) => row.map(quote).join(',')).join('\r\n') + '\r\n'
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'medicore-incidencias.csv'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
