export type UserRole = 'nursing' | 'admissions' | 'general-services' | 'it-support' | 'biomedical'
export type Priority = 'Crítica' | 'Alta' | 'Media' | 'Baja'
export type IncidentStatus = 'Pendiente' | 'Confirmada' | 'Nueva'
export type IncidentKind = 'equipo-medico' | 'alerta-ti'

export interface Incident {
  id: string; kind: IncidentKind; title: string; description: string; priority: Priority
  status: IncidentStatus; area: string; location: string; floor: number; reportedBy: string
  incidentType?: string; open?: boolean
  createdAt: string; symptom?: string; equipmentId?: string; stationId?: string; ip?: string; acknowledgedAt?: string
}
export interface Equipment { id: string; name: string; category: string; location: string; assetCode: string; brand: string; model: string }
export interface DemoState { incidents: Incident[]; activeRole: UserRole }
export const roleLabels: Record<UserRole, { name: string; title: string; initials: string }> = {
  nursing: { name: 'Carmen Mendoza', title: 'Enfermera asistencial', initials: 'CM' },
  admissions: { name: 'Jorge Ramírez', title: 'Encargado de Admisión', initials: 'JR' },
  'general-services': { name: 'Juan Ramos', title: 'Técnico de Servicios Generales', initials: 'JR' },
  'it-support': { name: 'Diego Salazar', title: 'Técnico de Sistemas', initials: 'DS' },
  biomedical: { name: 'Marco Doe', title: 'Ingeniero Biomédico', initials: 'MD' },
}
export const priorityRank: Record<Priority, number> = { 'Crítica': 4, Alta: 3, Media: 2, Baja: 1 }
