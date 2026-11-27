const mark = '/medicore-tab.png'

export function MediCoreBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`mc-brand${compact ? ' mc-brand-compact' : ''}`}>
      <img src={mark} alt="" width="64" height="64" />
      <span>Medi<span className="mc-brand-accent">Core</span></span>
    </span>
  )
}

export function MediCoreLaunch({ onFinish }: { onFinish: () => void }) {
  return (
    <div aria-hidden="true" className="mc-launch" onAnimationEnd={(event) => {
      if (event.target === event.currentTarget) onFinish()
    }}>
      <MediCoreBrand />
      <MediCorePulse />
    </div>
  )
}

function MediCorePulse() {
  return (
    <svg className="mc-pulse" viewBox="0 0 216 32" fill="none" aria-hidden="true">
      <path className="mc-pulse-track" d="M4 17H62L72 8L83 25L99 3L114 28L126 17H212" />
      <path className="mc-pulse-signal" pathLength="1" d="M4 17H62L72 8L83 25L99 3L114 28L126 17H212" />
      <circle cx="4" cy="17" r="3" />
      <circle cx="212" cy="17" r="3" />
    </svg>
  )
}

export function MediCoreLoading({ label }: { label: string }) {
  return (
    <div role="status" className="mc-loading">
      <div aria-hidden="true" className="mc-loading-brand">
        <MediCoreBrand compact />
        <MediCorePulse />
      </div>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
