export const demoRoles = ['nursing', 'admissions', 'general-services', 'it-support', 'biomedical'] as const
export type DemoRole = typeof demoRoles[number]

export interface DemoPrincipal {
  id: string
  name: string
  role: DemoRole
}
