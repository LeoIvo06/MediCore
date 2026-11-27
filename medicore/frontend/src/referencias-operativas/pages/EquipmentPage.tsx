import { ArrowLeft, Box, CalendarDays, ClipboardCheck, MapPin, Wrench } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Card, PageTitle, StatusBadge } from '../../shared/components'
import { useIncidents } from '../../incidencias/context/IncidentContext'
import { DemoApiError } from '../../shared/api/demoApi'
import { useDemoQuery } from '../../shared/api/useDemoQuery'
import { equipmentRecordPath, type EquipmentRecord } from '../api/equipmentRecords'

const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'UTC' })

export default function EquipmentPage() {
  const { equipmentId = '' } = useParams()
  const role = useIncidents().state.activeRole
  const allowed = role === 'biomedical'
  const { data: item, loading, error } = useDemoQuery<EquipmentRecord>(role, allowed ? equipmentRecordPath(equipmentId) : null)
  if (!allowed) return <p role="alert">La ficha está disponible para Ingeniería Biomédica.</p>
  if (loading) return <p role="status">Cargando ficha técnica…</p>
  if (!item) {
    const missing = error instanceof DemoApiError && error.status === 404
    return <p role="alert">{missing ? 'Equipo no encontrado.' : 'No se pudo cargar la ficha técnica.'}</p>
  }
  const { maintenance } = item
  return <>
    <Link to="/bandeja" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"><ArrowLeft size={16} />Volver a incidencias</Link>
    <PageTitle title="Ficha técnica del equipo" description="Datos del activo vinculado al reporte e historial de mantenimiento disponible." />
    <Card className="p-5 sm:p-7"><div className="flex flex-col gap-5 md:flex-row md:items-center"><div className="grid h-28 w-full place-items-center rounded-xl bg-slate-100 text-brand md:w-36"><Wrench size={42} /></div><div className="flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-brand">{item.category}</p><h2 className="mt-1 text-2xl font-bold">{item.name}</h2><p className="mt-2 text-sm text-muted">{item.brand} · {item.model}</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span className="inline-flex items-center gap-2"><MapPin size={16} className="text-brand" />{item.location}</span><span className="inline-flex items-center gap-2"><Box size={16} className="text-brand" />{item.assetCode}</span></div></div><StatusBadge status="Ficha disponible" /></div></Card>
    <Card className="mt-5 overflow-hidden"><div className="flex items-center gap-3 border-b border-line px-5 py-4"><div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-50 text-brand"><ClipboardCheck size={19} /></div><div><h2 className="font-semibold">Historial de mantenimiento</h2><p className="mt-0.5 text-xs text-muted">Registro de referencia para la demo del Sprint 1.</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50 text-xs text-muted"><tr><th className="px-5 py-3 font-medium">Fecha</th><th className="px-5 py-3 font-medium">Tipo de servicio</th><th className="px-5 py-3 font-medium">Descripción</th><th className="px-5 py-3 font-medium">Técnico</th><th className="px-5 py-3 font-medium">Estado</th></tr></thead><tbody className="divide-y divide-line">{maintenance.map((record) => <tr key={record.id}><td className="px-5 py-4"><span className="inline-flex items-center gap-2"><CalendarDays size={15} className="text-muted" />{dateFormat.format(new Date(record.date))}</span></td><td className="px-5 py-4">{record.type}</td><td className="px-5 py-4 text-muted">{record.details}</td><td className="px-5 py-4">{record.technician}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">{record.status}</span></td></tr>)}</tbody></table></div>
      {!maintenance.length && <p className="p-5 text-sm text-muted">Este equipo aún no tiene registros de mantenimiento.</p>}
    </Card>
  </>
}
