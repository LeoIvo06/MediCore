import type { GeneralServicesIncident, GeneralServicesPriority } from '../model/aggregates/GeneralServicesIncident.js'

const rank: Record<GeneralServicesPriority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 }

export function groupActiveIncidentsByFloor(incidents: readonly GeneralServicesIncident[]) {
  const ordered = incidents
    .filter((incident) => incident.closedAt === null)
    .sort((a, b) => a.floor - b.floor || rank[b.priority] - rank[a.priority] ||
      a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id))

  const floors = new Map<number, GeneralServicesIncident[]>()
  for (const incident of ordered) {
    const group = floors.get(incident.floor)
    if (group) group.push(incident)
    else floors.set(incident.floor, [incident])
  }
  return Array.from(floors, ([floor, incidents]) => ({ floor, incidents }))
}
