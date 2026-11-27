import { Bell, ChevronDown, ClipboardList, Home, MapPin, Menu, Moon, PlusCircle, Stethoscope, Sun, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { roleLabels, type UserRole } from '../../shared/types'
import { useIncidents } from '../../incidencias/context/IncidentContext'

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'nursing', label: 'Enfermería' }, { value: 'admissions', label: 'Admisión' },
  { value: 'general-services', label: 'Servicios Generales' }, { value: 'it-support', label: 'Soporte TI' },
  { value: 'biomedical', label: 'Ingeniería Biomédica' },
]

export default function AppLayout() {
  const { state, updateRole } = useIncidents()
  const [activeMenu, setActiveMenu] = useState<'navigation' | 'profile' | null>(null)
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  const location = useLocation()
  const headerRef = useRef<HTMLElement>(null)
  const navigationTrigger = useRef<HTMLButtonElement>(null)
  const profileTrigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!activeMenu) return
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setActiveMenu(null)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setActiveMenu(null)
      const trigger = activeMenu === 'navigation' ? navigationTrigger : profileTrigger
      trigger.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [activeMenu])

  function toggleTheme() {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    setDark(next === 'dark')
    try {
      localStorage.setItem('medicore-theme', next)
    } catch {
      // The current tab can still use the chosen theme.
    }
  }

  const profile = roleLabels[state.activeRole]
  const items = [
    { to: '/', label: 'Inicio', icon: Home },
    ...(state.activeRole === 'nursing' ? [{ to: '/reportar-falla', label: 'Reportar falla', icon: PlusCircle }] : []),
    ...(state.activeRole === 'admissions' ? [{ to: '/alerta-ti', label: 'Alerta rápida', icon: Bell }] : []),
    ...(['general-services', 'it-support', 'biomedical'].includes(state.activeRole) ? [{ to: '/bandeja', label: state.activeRole === 'biomedical' ? 'Bandeja biomédica' : 'Lista de incidentes', icon: ClipboardList }] : []),
    ...(state.activeRole === 'biomedical' ? [{ to: '/equipos/eq-vent-00123', label: 'Ficha técnica', icon: Stethoscope }] : []),
  ]
  return <div className="min-h-screen bg-page text-ink">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col bg-sidebar text-white lg:flex">
      <NavLink to="/" className="flex items-center gap-2 px-6 py-4">
        <span className="relative h-[21px] w-9 shrink-0 overflow-hidden" aria-hidden="true">
          <img src="/medicore-sidebar.png" alt="" className="absolute -left-[9px] -top-[3px] h-8 w-12 max-w-none" width="384" height="256" />
        </span>
        <span className="text-xl leading-7 font-bold tracking-tight">Medi<span className="text-[#30c4cb]">Core</span></span>
      </NavLink>
      <div className="flex items-center gap-3 px-5 pb-8">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-sky-100 text-accent"><span className="text-sm font-bold">{profile.initials}</span></div>
        <div className="min-w-0"><div className="truncate text-sm font-semibold">{profile.name}</div><div className="mt-0.5 truncate text-xs text-slate-300">{profile.title}</div></div>
      </div>
      <nav className="space-y-1 px-3">
        {items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm transition ${isActive ? 'bg-brand font-semibold text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={18} />{label}</NavLink>)}
      </nav>
      <div className="mt-auto border-t border-white/10 px-5 py-5 text-xs text-slate-300"><span className="inline-flex items-center gap-2"><MapPin size={14} />Demo · datos ficticios</span></div>
    </aside>
    <div className="lg:pl-[244px]">
      <header ref={headerRef} className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="flex min-h-[72px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-2">
            <button
              ref={navigationTrigger}
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'navigation' ? null : 'navigation')}
              className="grid size-11 shrink-0 place-items-center rounded-lg text-ink hover:bg-slate-100 lg:hidden"
              aria-label="Menú de navegación"
              aria-controls="mobile-navigation"
              aria-expanded={activeMenu === 'navigation'}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="truncate text-sm font-semibold">
              MediCore <span className="font-normal text-muted">/ {items.find((item) => location.pathname.startsWith(item.to) && item.to !== '/')?.label ?? 'Inicio'}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-5">
            <span className="hidden text-xs text-muted sm:inline">{new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date())}</span>
            <button type="button" className="relative grid size-11 place-items-center rounded-lg border border-line text-ink" aria-label="Notificaciones">
              <Bell size={18} aria-hidden="true" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-white">{profile.initials}</div>
              <div className="hidden leading-tight xl:block"><div className="text-xs font-semibold">{profile.name}</div><div className="mt-1 text-[11px] text-muted">{profile.title}</div></div>
            </div>
            <div className="relative">
              <button
                ref={profileTrigger}
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'profile' ? null : 'profile')}
                className="flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-2 text-xs text-ink hover:bg-slate-100"
                aria-label="Perfil demo"
                aria-controls="profile-options"
                aria-expanded={activeMenu === 'profile'}
              >
                <UserRound size={17} className="md:hidden" aria-hidden="true" />
                <span className="hidden md:inline">Perfil demo</span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              <div id="profile-options" hidden={activeMenu !== 'profile'} className="absolute right-0 top-full mt-1 max-h-[calc(100dvh-5rem)] w-56 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-xl">
                {roleOptions.map((role) => (
                  <button
                    type="button"
                    key={role.value}
                    onClick={() => { updateRole(role.value); setActiveMenu(null); profileTrigger.current?.focus() }}
                    aria-pressed={state.activeRole === role.value}
                    className={"block min-h-11 w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 " + (state.activeRole === role.value ? 'font-semibold text-accent' : 'text-ink')}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <nav id="mobile-navigation" hidden={activeMenu !== 'navigation'} aria-label="Navegación principal" className="bg-sidebar px-4 py-2 text-white lg:hidden">
          {items.map(({ to, label }) => (
            <NavLink onClick={() => setActiveMenu(null)} key={to} to={to} end={to === '/'} className="flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-white/10 aria-[current=page]:bg-brand">
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      <footer className="px-5 pb-[calc(5rem+env(safe-area-inset-bottom))] text-center text-xs text-muted lg:pl-10">MediCore · Sprint 1 · Entorno de demostración con datos ficticios</footer>
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 grid size-12 place-items-center rounded-full border border-line bg-surface text-ink shadow-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label={dark ? 'Activar modo claro' : 'Activar modo noche'}
        title={dark ? 'Activar modo claro' : 'Activar modo noche'}
      >
        {dark ? <Sun size={21} aria-hidden="true" /> : <Moon size={21} aria-hidden="true" />}
      </button>
    </div>
  </div>
}
