import type { ReactNode } from 'react'
import type { Priority } from './types'

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="mc-page-title">{title}</h1>{description && <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">{description}</p>}</div>{action}</div>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`mc-card ${className}`}>{children}</section>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    'Crítica': 'bg-red-100 text-red-700', Alta: 'bg-orange-100 text-orange-700',
    Media: 'bg-emerald-100 text-emerald-700', Baja: 'bg-slate-100 text-slate-600',
  }
  return <span className={`mc-badge ${styles[priority]}`}>{priority}</span>
}

export function StatusBadge({ status }: { status: string }) {
  const confirmed = status === 'Confirmada' || status === 'Resuelto'
  return <span className={`mc-badge gap-1.5 ${confirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${confirmed ? 'bg-emerald-600' : 'bg-sky-600'}`} />{status}</span>
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-ink"><span className="mb-1.5 block">{label}</span>{children}{error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}</label>
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`mc-control placeholder:text-muted ${props.className ?? ''}`} />
}
export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`mc-control ${props.className ?? ''}`} />
}
