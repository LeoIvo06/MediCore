import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageTitle, PriorityBadge, SelectInput, StatusBadge, TextInput } from '../../shared/components'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import { priorityRank, type Incident } from '../../shared/types'
import { equipmentIncidentsPath } from '../api/equipmentIncidents'

const emptyIncidents: Incident[] = []
import { useIncidents } from '../context/IncidentContext'

export default function InboxPage() {
  const { state } = useIncidents()
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('Todas')
  const [floor, setFloor] = useState('Todos')
  const role = state.activeRole
  const isIT = role === 'it-support'
  const isBiomedical = role === 'biomedical'
  const title = isIT ? 'Bandeja de soporte TI' : isBiomedical ? 'Bandeja biomédica' : 'Lista de incidentes'
  const description = isIT ? 'Alertas rápidas recibidas de Admisión.' : isBiomedical ? 'Incidentes relacionados con equipos médicos.' : 'Incidentes activos agrupados por piso y prioridad.'
  const { data, loading, error } = useDemoQuery<Incident[]>(role, isBiomedical ? equipmentIncidentsPath : null)
  const incidents = isBiomedical ? data ?? emptyIncidents : state.incidents
  const rows = useMemo(() => incidents.filter((incident) => {
    if (isIT && incident.kind !== 'alerta-ti') return false
    if (isBiomedical && incident.area !== 'Biomédica') return false
    if (!isIT && !isBiomedical && incident.area !== 'Servicios Generales') return false
    const query = search.toLocaleLowerCase('es')
    const matchesSearch = !query || `${incident.id} ${incident.title} ${incident.description} ${incident.location}`.toLocaleLowerCase('es').includes(query)
    const matchesPriority = priority === 'Todas' || incident.priority === priority
    const matchesFloor = floor === 'Todos' || String(incident.floor) === floor
    return matchesSearch && matchesPriority && matchesFloor
  }).sort((a, b) => a.floor - b.floor || priorityRank[b.priority] - priorityRank[a.priority] || b.createdAt.localeCompare(a.createdAt)), [incidents, isIT, isBiomedical, search, priority, floor])

  return <>
    <PageTitle title={title} description={description} />
    <Card className="mb-5 p-4"><div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_190px_170px]"><label className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por ID o descripción" className="pl-9" aria-label="Buscar incidentes" /></label><SelectInput value={priority} onChange={(event) => setPriority(event.target.value)}><option>Todas</option>{['Crítica', 'Alta', 'Media', 'Baja'].map((item) => <option key={item}>{item}</option>)}</SelectInput><SelectInput value={floor} onChange={(event) => setFloor(event.target.value)}><option>Todos</option>{[1, 2, 3, 4].map((item) => <option key={item} value={item}>Piso {item}</option>)}</SelectInput></div></Card>
    <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 className="font-semibold">{isIT ? 'Alertas recibidas' : isBiomedical ? 'Incidentes de equipos' : 'Bandeja de incidentes'}</h2><p className="mt-1 text-xs text-muted">{rows.length} resultados · ordenados por piso y prioridad</p></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs text-muted"><tr><th className="px-4 py-3 font-medium">Prioridad</th><th className="px-4 py-3 font-medium">ID / Incidente</th><th className="px-4 py-3 font-medium">Descripción</th><th className="px-4 py-3 font-medium">Ubicación</th><th className="px-4 py-3 font-medium">Estado</th>{isIT && <th className="px-4 py-3 font-medium">Acuse</th>}<th className="px-4 py-3 font-medium">Detalle</th></tr></thead>
        <tbody className="divide-y divide-line">{rows.map((incident) => <tr key={incident.id} className="hover:bg-slate-50/80"><td className="px-4 py-4"><PriorityBadge priority={incident.priority} /></td><td className="px-4 py-4"><Link to={`/incidentes/${incident.id}`} className="font-semibold text-brand hover:underline">{incident.id}</Link><div className="mt-1 max-w-[240px] font-medium text-ink">{incident.title}</div></td><td className="max-w-[240px] px-4 py-4 text-muted">{incident.description}{incident.stationId && <div className="mt-1 text-xs">Estación {incident.stationId} · IP {incident.ip}</div>}</td><td className="px-4 py-4 text-ink">{incident.location}<div className="mt-1 text-xs text-muted">Piso {incident.floor}</div></td><td className="px-4 py-4"><StatusBadge status={incident.status} /></td>{isIT && <td className="px-4 py-4 text-xs text-muted">{incident.acknowledgedAt ? new Date(incident.acknowledgedAt).toLocaleString('es-PE') : 'Pendiente'}</td>}<td className="px-4 py-4"><Link to={`/incidentes/${incident.id}`} className="inline-flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-brand hover:bg-sky-50">Ver detalle <ArrowRight size={14} /></Link></td></tr>)}</tbody>
      </table></div>
      {loading && <p role="status" className="p-5">Cargando incidentes…</p>}
      {error && <p role="alert" className="p-5 text-red-600">No se pudo cargar la bandeja. Recarga la página para reintentar.</p>}
      {!loading && !error && !rows.length && <div className="px-5 py-12 text-center text-sm text-muted">No hay incidentes que coincidan con los filtros.</div>}
    </Card>
  </>
}
