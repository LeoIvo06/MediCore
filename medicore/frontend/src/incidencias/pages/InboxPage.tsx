import { ArrowRight, Download, Search } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Field, PageTitle, PriorityBadge, SelectInput, StatusBadge, TextInput } from '../../shared/components'
import { MediCoreLoading } from '../../shared/MediCoreBrand'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import { priorityRank, type Incident } from '../../shared/types'
import { equipmentIncidentsPath } from '../api/equipmentIncidents'
import { generalServicesIncidentsPath, type GeneralServicesFloorGroup } from '../api/generalServicesIncidents'
import { supportAlertsPath } from '../api/itAlerts'
import { useIncidents } from '../context/IncidentContext'
import { exportIncidentList } from '../utils/exportIncidentList'
import { emptyInboxFilters, inboxPriorities, inboxStatuses, loadInboxFilters, saveInboxFilters, type InboxFilters } from '../utils/inboxFilters'

export default function InboxPage() {
  const role = useIncidents().state.activeRole
  if (role === 'nursing' || role === 'admissions') return <p role="alert">La bandeja está disponible para las áreas de soporte.</p>
  return <IncidentInbox key={role} role={role} />
}

function IncidentInbox({ role }: { role: 'it-support' | 'biomedical' | 'general-services' }) {
  const [filters, setFilters] = useState(() => loadInboxFilters(role))
  const { search, priority, floor, status } = filters
  const hasFilters = Object.values(filters).some(Boolean)
  const searchInput = useRef<HTMLInputElement>(null)
  const [revision, setRevision] = useState(0)
  const resultsHeading = useRef<HTMLHeadingElement>(null)
  const isGeneralServices = role === 'general-services'
  const isIT = role === 'it-support'
  const isBiomedical = role === 'biomedical'
  const title = isIT ? 'Bandeja de soporte TI' : isBiomedical ? 'Bandeja biomédica' : 'Lista de incidentes'
  const description = isIT ? 'Alertas rápidas recibidas de Admisión.' : isBiomedical ? 'Incidentes relacionados con equipos médicos.' : 'Incidentes agrupados por piso y prioridad.'
  const inbox = useDemoQuery<Incident[]>(role, isIT ? supportAlertsPath : isBiomedical ? equipmentIncidentsPath : null, revision)
  const generalServices = useDemoQuery<GeneralServicesFloorGroup[]>(role, isGeneralServices ? `${generalServicesIncidentsPath}?incluirResueltos=1` : null, revision)
  const { loading, error } = isGeneralServices ? generalServices : inbox
  const incomingGroups = isGeneralServices ? generalServices.data ?? [] : [{
    floor: null,
    incidents: (inbox.data ?? []).slice().sort((a, b) =>
      a.floor - b.floor || priorityRank[b.priority] - priorityRank[a.priority] || b.createdAt.localeCompare(a.createdAt)),
  }]
  const availableFloors = isGeneralServices ? incomingGroups.flatMap((group) => group.floor ?? []) : [1, 2, 3, 4]
  const floors = Array.from(new Set(floor ? [...availableFloors, Number(floor)] : availableFloors)).sort((a, b) => a - b)
  const query = search.trim().toLocaleLowerCase('es')
  const groups = incomingGroups.map((group) => ({
    ...group,
    incidents: group.incidents.filter((incident) => {
      const searchable = `${incident.id} ${incident.title} ${incident.description} ${incident.location}`.toLocaleLowerCase('es')
      return searchable.includes(query) &&
        (!priority || incident.priority === priority) &&
        (!floor || String(incident.floor) === floor) &&
        (!status || incident.status === status)
    }),
  })).filter((group) => group.incidents.length > 0)
  const count = groups.reduce((total, group) => total + group.incidents.length, 0)
  const hasIncidents = incomingGroups.some((group) => group.incidents.length > 0)
  const hasResults = !loading && !error && count > 0

  function applyFilters(next: InboxFilters) {
    setFilters(next)
    saveInboxFilters(role, next)
  }

  return <>
    <PageTitle title={title} description={description} />
    <Card className="mb-5 p-4">
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_repeat(3,minmax(7rem,9rem))_auto]">
        <Field label="Buscar incidentes">
          <span className="relative block">
            <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <TextInput ref={searchInput} value={search} onChange={(event) => applyFilters({ ...filters, search: event.target.value })} placeholder="ID o descripción" className="pl-9" />
          </span>
        </Field>
        <Field label="Prioridad">
          <SelectInput value={priority} onChange={(event) => applyFilters({ ...filters, priority: event.target.value })}>
            <option value="">Todas</option>
            {inboxPriorities.map((item) => <option key={item}>{item}</option>)}
          </SelectInput>
        </Field>
        <Field label="Piso">
          <SelectInput value={floor} onChange={(event) => applyFilters({ ...filters, floor: event.target.value })}>
            <option value="">Todos</option>
            {floors.map((item) => <option key={item} value={item}>Piso {item}</option>)}
          </SelectInput>
        </Field>
        <Field label="Estado">
          <SelectInput value={status} onChange={(event) => applyFilters({ ...filters, status: event.target.value })}>
            <option value="">Todos</option>
            {inboxStatuses[role].map((item) => <option key={item}>{item}</option>)}
          </SelectInput>
        </Field>
        <button type="button" className="mc-button mc-button-secondary xl:whitespace-nowrap" disabled={!hasFilters} onClick={() => {
          applyFilters(emptyInboxFilters)
          searchInput.current?.focus()
        }}>Limpiar filtros</button>
      </div>
    </Card>
    <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4"><div><h2 ref={resultsHeading} tabIndex={-1} className="font-semibold">{isIT ? 'Alertas recibidas' : isBiomedical ? 'Incidentes de equipos' : 'Bandeja de incidentes'}</h2>
      {hasResults && <p className="mt-1 text-xs text-muted">{count === 1 ? '1 resultado' : count + ' resultados'} · ordenados por piso y prioridad</p>}</div>
      <button type="button" className="mc-button mc-button-secondary mc-button-compact" disabled={!hasResults} onClick={() => exportIncidentList(groups.flatMap((group) => group.incidents), isIT)}>
        <Download size={16} aria-hidden="true" /> Exportar CSV
      </button></div>
      {hasResults && <IncidentInboxList groups={groups} />}
      {hasResults && <div className="hidden overflow-x-auto xl:block" role="region" aria-label="Tabla de incidentes" tabIndex={0}><table className="mc-table"><thead className="bg-slate-50 text-xs text-muted"><tr><th className="px-4 py-3 font-medium">Prioridad</th><th className="px-4 py-3 font-medium">ID / Incidente</th><th className="px-4 py-3 font-medium">Descripción</th><th className="px-4 py-3 font-medium">Ubicación</th><th className="px-4 py-3 font-medium">Estado</th>{isIT && <th className="px-4 py-3 font-medium">Acuse</th>}<th className="px-4 py-3 font-medium">Detalle</th></tr></thead>
        {groups.map((group) => <tbody key={group.floor ?? 'incidents'} className="divide-y divide-line">
          {group.floor !== null && <tr className="border-t border-line bg-sky-50/80"><th scope="rowgroup" colSpan={6} className="px-4 py-2 text-left font-semibold text-accent">Piso {group.floor}</th></tr>}
          {group.incidents.map((incident) => <tr key={incident.id} className="hover:bg-slate-50/80"><td className="px-4 py-4"><PriorityBadge priority={incident.priority} /></td><td className="px-4 py-4"><Link to={`/incidentes/${incident.id}`} className="font-semibold text-accent hover:underline">{incident.id}</Link><div className="mt-1 max-w-[240px] font-medium text-ink">{incident.title}</div></td><td className="max-w-[240px] px-4 py-4 text-muted">{incident.description}{incident.stationId && <div className="mt-1 text-xs">Estación {incident.stationId}{incident.ip ? ` · IP ${incident.ip}` : ''}</div>}</td><td className="px-4 py-4 text-ink">{incident.location}<div className="mt-1 text-xs text-muted">Piso {incident.floor}</div></td><td className="px-4 py-4"><StatusBadge status={incident.status} /></td>{isIT && <td className="px-4 py-4 text-xs text-muted">{incident.acknowledgedAt ? new Date(incident.acknowledgedAt).toLocaleString('es-PE') : 'Pendiente'}</td>}<td className="px-4 py-4"><Link to={`/incidentes/${incident.id}`} className="mc-button mc-button-secondary mc-button-compact">Ver detalle <ArrowRight size={14} /></Link></td></tr>)}
        </tbody>)}
      </table></div>}
      {loading && <MediCoreLoading label="Cargando incidentes…" />}
      {error && (
        <div className="space-y-3 px-5 py-8">
          <p role="alert" className="text-sm">No se pudo cargar la bandeja. Puedes reintentar sin perder tus filtros.</p>
          <button type="button" className="mc-button mc-button-secondary" onClick={() => {
            resultsHeading.current?.focus()
            setRevision((current) => current + 1)
          }}>Reintentar</button>
        </div>
      )}
      {!loading && !error && !count && (
        <p role="status" className="px-5 py-8 text-sm text-muted">
          {hasIncidents ? 'No hay incidentes que coincidan con los filtros.' : 'Todavía no hay incidentes en esta bandeja.'}
        </p>
      )}
    </Card>
  </>
}


function IncidentInboxList({ groups }: { groups: { floor: number | null; incidents: Incident[] }[] }) {
  return (
    <div className="divide-y divide-line xl:hidden">
      {groups.map(({ floor, incidents }) => (
        <div key={floor ?? 'incidents'}>
          {floor !== null && (
            <h3 className="bg-sky-50/80 px-4 py-2 text-sm font-semibold text-accent">Piso {floor}</h3>
          )}
          <ul role="list" className="divide-y divide-line">
            {incidents.map((incident) => (
              <li key={incident.id} className="space-y-3 px-4 py-4">
                <div className="[overflow-wrap:anywhere]">
                  <p className="text-xs font-semibold text-accent">{incident.id}</p>
                  <p className="mt-1 font-semibold text-ink">{incident.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {incident.location}{floor === null && <> · Piso {incident.floor}</>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={incident.status} />
                  <PriorityBadge priority={incident.priority} />
                </div>
                <Link
                  to={`/incidentes/${incident.id}`}
                  aria-label={`Ver detalle de ${incident.id}`}
                  className="mc-button mc-button-secondary"
                >
                  Ver detalle <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
