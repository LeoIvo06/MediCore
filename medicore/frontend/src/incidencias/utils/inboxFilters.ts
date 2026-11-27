import type { IncidentStatus, Priority, UserRole } from '../../shared/types'

export const inboxPriorities: readonly Priority[] = ['Crítica', 'Alta', 'Media', 'Baja']

type InboxRole = Extract<UserRole, 'it-support' | 'biomedical' | 'general-services'>

export const inboxStatuses: Record<InboxRole, readonly IncidentStatus[]> = {
  'it-support': ['Nueva', 'Confirmada', 'Resuelto'],
  biomedical: ['Pendiente', 'Resuelto'],
  'general-services': ['Pendiente', 'Resuelto'],
}

export const emptyInboxFilters = { search: '', priority: '', floor: '', status: '' }
export type InboxFilters = typeof emptyInboxFilters

function storageKey(role: InboxRole) {
  return 'medicore-inbox-filters:' + role
}

export function loadInboxFilters(role: InboxRole): InboxFilters {
  try {
    const stored = localStorage.getItem(storageKey(role))
    if (!stored) return emptyInboxFilters
    const value = JSON.parse(stored) as Partial<InboxFilters> | null
    return {
      search: typeof value?.search === 'string' ? value.search : '',
      priority: inboxPriorities.find((priority) => priority === value?.priority) ?? '',
      floor: typeof value?.floor === 'string' && /^[1-9]\d*$/.test(value.floor) && Number.isSafeInteger(Number(value.floor)) ? value.floor : '',
      status: inboxStatuses[role].find((status) => status === value?.status) ?? '',
    }
  } catch {
    return emptyInboxFilters
  }
}

export function saveInboxFilters(role: InboxRole, filters: InboxFilters) {
  try {
    if (Object.values(filters).some(Boolean)) {
      localStorage.setItem(storageKey(role), JSON.stringify(filters))
    } else {
      localStorage.removeItem(storageKey(role))
    }
  } catch {
    // The active view can still filter when browser storage is unavailable.
  }
}

