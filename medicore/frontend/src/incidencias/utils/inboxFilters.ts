import type { IncidentStatus, Priority, UserRole } from '../../shared/types'

export const inboxPriorities: readonly Priority[] = ['Crítica', 'Alta', 'Media', 'Baja']

type InboxRole = Extract<UserRole, 'it-support' | 'biomedical' | 'general-services'>

export const inboxStatuses: Record<InboxRole, readonly IncidentStatus[]> = {
  'it-support': ['Nueva', 'Confirmada', 'Resuelto'],
  biomedical: ['Pendiente', 'Resuelto'],
  'general-services': ['Pendiente', 'Resuelto'],
}

export const allInboxStatuses = 'all'

export interface InboxFilters {
  search: string
  priority: string
  floor: string
  status: string
}

export function defaultInboxFilters(role: InboxRole): InboxFilters {
  return { search: '', priority: '', floor: '', status: role === 'general-services' ? 'Pendiente' : allInboxStatuses }
}

export function hasCustomInboxFilters(role: InboxRole, filters: InboxFilters) {
  return Boolean(filters.search || filters.priority || filters.floor || filters.status !== defaultInboxFilters(role).status)
}

function storageKey(role: InboxRole) {
  return 'medicore-inbox-filters:' + role
}

export function loadInboxFilters(role: InboxRole): InboxFilters {
  const defaults = defaultInboxFilters(role)
  try {
    const stored = localStorage.getItem(storageKey(role))
    if (!stored) return defaults
    const value = JSON.parse(stored) as Partial<InboxFilters> | null
    return {
      search: typeof value?.search === 'string' ? value.search : '',
      priority: inboxPriorities.find((priority) => priority === value?.priority) ?? '',
      floor: typeof value?.floor === 'string' && /^[1-9]\d*$/.test(value.floor) && Number.isSafeInteger(Number(value.floor)) ? value.floor : '',
      status: value?.status === allInboxStatuses
        ? allInboxStatuses
        : inboxStatuses[role].find((status) => status === value?.status) ?? defaults.status,
    }
  } catch {
    return defaults
  }
}

export function saveInboxFilters(role: InboxRole, filters: InboxFilters) {
  try {
    if (hasCustomInboxFilters(role, filters)) {
      localStorage.setItem(storageKey(role), JSON.stringify(filters))
    } else {
      localStorage.removeItem(storageKey(role))
    }
  } catch {
    // The active view can still filter when browser storage is unavailable.
  }
}

