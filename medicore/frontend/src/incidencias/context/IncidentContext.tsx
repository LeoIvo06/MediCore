import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DemoState, UserRole } from '../../shared/types'
import { loadDemoState, saveDemoState, setRole } from '../api/demoRepository'

interface IncidentContextValue {
  state: DemoState
  updateRole: (role: UserRole) => void
}
const IncidentContext = createContext<IncidentContextValue | null>(null)

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadDemoState)
  useEffect(() => saveDemoState(state), [state])
  const value = useMemo<IncidentContextValue>(() => ({
    state,
    updateRole: (role) => setState((current) => setRole(current, role)),
  }), [state])
  return <IncidentContext.Provider value={value}>{children}</IncidentContext.Provider>
}

export function useIncidents() {
  const context = useContext(IncidentContext)
  if (!context) throw new Error('useIncidents debe usarse dentro de IncidentProvider')
  return context
}
