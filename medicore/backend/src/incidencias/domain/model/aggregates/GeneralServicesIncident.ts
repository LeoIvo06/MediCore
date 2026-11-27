export type GeneralServicesPriority = 'Critical' | 'High' | 'Medium' | 'Low'

export interface GeneralServicesIncident {
  id: string
  title: string
  incidentType: string
  description: string
  symptom: string
  location: string
  floor: number
  priority: GeneralServicesPriority
  reportedBy: string
  createdAt: Date
  closedAt: Date | null
}
