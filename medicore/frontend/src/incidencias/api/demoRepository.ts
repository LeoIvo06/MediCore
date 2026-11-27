import { roleLabels, type DemoState } from '../../shared/types'

const STORAGE_KEY = 'medicore-demo-v1'
const initialState: DemoState = { activeRole: 'nursing' }

export function loadDemoState(): DemoState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const activeRole = stored ? JSON.parse(stored)?.activeRole : null
    return typeof activeRole === 'string' && Object.hasOwn(roleLabels, activeRole)
      ? { activeRole: activeRole as DemoState['activeRole'] }
      : initialState
  } catch {
    return initialState
  }
}

export function saveDemoState(state: DemoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
