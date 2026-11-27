import { Bell, ChevronDown, ClipboardList, Home, MapPin, Menu, PlusCircle, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { roleLabels, type UserRole } from '../../shared/types'
import { useIncidents } from '../../incidencias/context/IncidentContext'

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'nursing', label: 'Enfermería' }, { value: 'admissions', label: 'Admisión' },
  { value: 'general-services', label: 'Servicios Generales' }, { value: 'it-support', label: 'Soporte TI' },
  { value: 'biomedical', label: 'Ingeniería Biomédica' },
]

export default function AppLayout() {
  const { state, updateRole } = useIncidents()
  const [menuOpen, setMenuOpen] = useState(false)
  const profile = roleLabels[state.activeRole]
  const items = [
    { to: '/', label: 'Inicio', icon: Home },
    ...(state.activeRole === 'nursing' ? [{ to: '/reportar-falla', label: 'Reportar falla', icon: PlusCircle }] : []),
    ...(state.activeRole === 'admissions' ? [{ to: '/alerta-ti', label: 'Alerta rápida', icon: Bell }] : []),
    ...(['general-services', 'it-support', 'biomedical'].includes(state.activeRole) ? [{ to: '/bandeja', label: state.activeRole === 'biomedical' ? 'Bandeja biomédica' : 'Lista de incidentes', icon: ClipboardList }] : []),
    ...(state.activeRole === 'biomedical' ? [{ to: '/equipos/eq-vent-00123', label: 'Ficha técnica', icon: Stethoscope }] : []),
  ]
  return <div className="min-h-screen bg-[#f3f6f9] text-ink">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col bg-sidebar text-white lg:flex">
      <NavLink to="/" className="flex items-center gap-2.5 px-6 pb-8 pt-6 text-[26px] font-bold tracking-tight">
        <img src="/medicore-mark.svg" alt="" className="size-8 shrink-0" width="32" height="32" />
        <span>Medi<span className="text-[#3cbfd5]">Core</span></span>
      </NavLink>
      <div className="flex items-center gap-3 px-5 pb-8">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-sky-100 text-sidebar"><span className="text-sm font-bold">{profile.initials}</span></div>
        <div className="min-w-0"><div className="truncate text-sm font-semibold">{profile.name}</div><div className="mt-0.5 truncate text-xs text-slate-300">{profile.title}</div></div>
      </div>
      <nav className="space-y-1 px-3">
        {items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm transition ${isActive ? 'bg-brand font-semibold text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={18} />{label}</NavLink>)}
      </nav>
      <div className="mt-auto border-t border-white/10 px-5 py-5 text-xs text-slate-300"><span className="inline-flex items-center gap-2"><MapPin size={14} />Demo · datos ficticios</span></div>
    </aside>
    <div className="lg:pl-[244px]">
      <header className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-7">
        <div className="flex items-center gap-3"><button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-ink hover:bg-slate-100 lg:hidden" aria-label="Abrir menú"><Menu size={20} /></button><div className="text-sm font-semibold">MediCore <span className="font-normal text-muted">/ {items.find((item) => location.pathname.startsWith(item.to) && item.to !== '/')?.label ?? 'Inicio'}</span></div></div>
        <div className="flex items-center gap-3 sm:gap-5"><span className="hidden text-xs text-muted sm:inline">{new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date())}</span><button className="relative rounded-lg border border-line p-2 text-sidebar" aria-label="Notificaciones"><Bell size={18} /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" /></button><div className="hidden items-center gap-2 sm:flex"><div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-white">{profile.initials}</div><div className="hidden leading-tight xl:block"><div className="text-xs font-semibold">{profile.name}</div><div className="mt-1 text-[11px] text-muted">{profile.title}</div></div></div><div className="relative"><button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-slate-100"><span className="hidden md:inline">Perfil demo</span><ChevronDown size={14} /></button>{menuOpen && <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-line bg-white p-1 shadow-xl">{roleOptions.map((role) => <button key={role.value} onClick={() => { updateRole(role.value); setMenuOpen(false) }} className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 ${state.activeRole === role.value ? 'font-semibold text-brand' : 'text-ink'}`}>{role.label}</button>)}</div>}</div></div>
      </header>
      {menuOpen && <nav className="border-b border-line bg-sidebar px-4 py-2 text-white lg:hidden">{items.map(({ to, label }) => <NavLink onClick={() => setMenuOpen(false)} key={to} to={to} className="block rounded-md px-3 py-2 text-sm hover:bg-white/10">{label}</NavLink>)}</nav>}
      <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      <footer className="px-5 pb-6 text-center text-xs text-muted lg:pl-10">MediCore · Sprint 1 · Entorno de demostración con datos ficticios</footer>
    </div>
  </div>
}
