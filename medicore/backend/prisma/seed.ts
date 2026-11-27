import 'dotenv/config'
import { createPrismaClient } from '../src/shared/infrastructure/persistence/prisma/client.js'
import { hashDemoPassword } from '../src/shared/infrastructure/security/DemoPassword.js'

const url = process.env.DATABASE_URL
if (!url) throw new Error('Configura DATABASE_URL en backend/.env.')
const prisma = createPrismaClient(url)

const locations = [
  { id: 'uci-3', label: 'UCI · Piso 3', floor: 3 },
  { id: 'emergencia-1', label: 'Emergencia · Piso 1', floor: 1 },
  { id: 'hospitalizacion-4', label: 'Hospitalización · Piso 4', floor: 4 },
  { id: 'consulta-2', label: 'Consulta Externa · Piso 2', floor: 2 },
]

const equipment = [
  { id: 'eq-vent-00123', name: 'Ventilador mecánico VM-00123', category: 'Soporte respiratorio', brand: 'Dräger', model: 'Evita V500', assetCode: 'EQ-000456', location: 'UCI · Cama 5', locationId: 'uci-3' },
  { id: 'eq-monitor-04567', name: 'Monitor multiparámetro MM-04567', category: 'Monitoreo', brand: 'Philips', model: 'IntelliVue MX450', assetCode: 'EQ-000457', location: 'Emergencia · Box 3', locationId: 'emergencia-1' },
  { id: 'eq-bomba-07890', name: 'Bomba de infusión BI-07890', category: 'Infusión', brand: 'B. Braun', model: 'Infusomat Space', assetCode: 'EQ-000458', location: 'Hospitalización · Piso 4', locationId: 'hospitalizacion-4' },
  { id: 'eq-ecg-01145', name: 'Electrocardiógrafo ECG-01145', category: 'Diagnóstico', brand: 'GE Healthcare', model: 'MAC 2000', assetCode: 'EQ-000459', location: 'Consulta Externa · Consultorio 2', locationId: 'consulta-2' },
]

const symptoms = [
  { id: 'no-enciende', label: 'No enciende' },
  { id: 'alarma-constante', label: 'Alarma constante' },
  { id: 'lecturas-inestables', label: 'Lecturas inestables' },
  { id: 'dano-fisico', label: 'Daño físico visible' },
  { id: 'falla-energia', label: 'Falla de energía' },
]

const stations = [
  { id: 'ADM-01', label: 'ADM-01 · Admisión, Planta 1', location: 'Módulo de Admisión · Planta 1', floor: 1, ip: '10.20.1.41' },
  { id: 'ADM-02', label: 'ADM-02 · Admisión, Planta 1', location: 'Módulo de Admisión · Planta 1', floor: 1, ip: null },
  { id: 'ADM-03', label: 'ADM-03 · Admisión, Planta 2', location: null, floor: 2, ip: '10.20.2.15' },
  { id: 'ADM-04', label: 'ADM-04 · Admisión, Planta 2', location: null, floor: 2, ip: null },
]

const maintenance = [
  { id: 'mtto-vent-1', equipmentId: 'eq-vent-00123', date: new Date('2024-04-10'), type: 'Calibración', details: 'Calibración anual de parámetros.', technician: 'Luis Pérez', status: 'Completo' },
  { id: 'mtto-vent-2', equipmentId: 'eq-vent-00123', date: new Date('2024-01-12'), type: 'Preventivo', details: 'Mantenimiento preventivo general.', technician: 'María González', status: 'Completo' },
  { id: 'mtto-monitor-1', equipmentId: 'eq-monitor-04567', date: new Date('2024-05-16'), type: 'Preventivo', details: 'Verificación de sensores y alarmas.', technician: 'Carlos Rivas', status: 'Completo' },
]

const profiles = [
  { id: 'enfermeria', name: 'Carmen Mendoza', role: 'nursing', password: 'medicore-demo-cm' },
  { id: 'admision', name: 'Jorge Ramírez', role: 'admissions', password: 'medicore-demo-jr' },
  { id: 'servicios-generales', name: 'Juan Ramos', role: 'general-services', password: 'medicore-demo-sg' },
  { id: 'soporte-ti', name: 'Diego Salazar', role: 'it-support', password: 'medicore-demo-ds' },
  { id: 'biomedica', name: 'Marco Doe', role: 'biomedical', password: 'medicore-demo-md' },
]

const generalServicesIncidents = [
  {
    id: 'INC-2026-0139', title: 'Sin red Wi-Fi en el área de Emergencias', incidentType: 'Conectividad',
    description: 'La conexión no está disponible en el área.', symptom: 'Red Wi-Fi no disponible',
    location: 'Emergencias · Box 2', floor: 1, priority: 'Medium', reportedBy: 'Ana Torres',
    createdAt: new Date('2026-10-14T09:30:00-05:00'),
  },
  {
    id: 'INC-2026-0140', title: 'Falla en el sistema de agua caliente', incidentType: 'Instalaciones sanitarias',
    description: 'Las duchas del área de hospitalización tienen agua fría.', symptom: 'Agua fría al abrir la ducha',
    location: 'Hospitalización · Habitación 306', floor: 3, priority: 'High', reportedBy: 'Pedro Aliaga',
    createdAt: new Date('2026-10-14T09:50:00-05:00'),
  },
  {
    id: 'INC-2026-0141', title: 'Impresora de laboratorio sin conexión', incidentType: 'Equipo de oficina',
    description: 'No se reciben trabajos de impresión.', symptom: 'Trabajos de impresión en espera',
    location: 'Laboratorio · Estación de impresión 1', floor: 3, priority: 'High', reportedBy: 'Carmen Vega',
    createdAt: new Date('2026-10-14T10:13:00-05:00'),
  },
  {
    id: 'INC-2026-0143', title: 'Luminaria intermitente', incidentType: 'Instalaciones eléctricas',
    description: 'La luminaria parpadea al encenderse.', symptom: 'Parpadeo repetido',
    location: 'Laboratorio · Pasillo este', floor: 3, priority: 'Medium', reportedBy: 'Carmen Vega',
    createdAt: new Date('2026-10-14T08:00:00-05:00'),
  },
  {
    id: 'INC-2026-0144', title: 'Puerta de almacén atascada', incidentType: 'Infraestructura',
    description: 'Se corrigió el cierre de la puerta.', symptom: 'La hoja rozaba el marco',
    location: 'Almacén · Acceso principal', floor: 1, priority: 'High', reportedBy: 'Pedro Aliaga',
    createdAt: new Date('2026-10-14T07:45:00-05:00'), closedAt: new Date('2026-10-14T09:00:00-05:00'),
  },
] satisfies import('../src/shared/infrastructure/persistence/prisma/generated/client.js').Prisma.GeneralServicesIncidentCreateManyInput[]

try {
  const users = await Promise.all(profiles.map(async ({ password, ...profile }) => ({
    ...profile, passwordHash: await hashDemoPassword(password),
  })))

  await prisma.$transaction([
    prisma.operationalLocation.createMany({ data: locations, skipDuplicates: true }),
    prisma.operationalEquipment.createMany({ data: equipment, skipDuplicates: true }),
    prisma.operationalSymptom.createMany({ data: symptoms, skipDuplicates: true }),
    prisma.operationalStation.createMany({ data: stations, skipDuplicates: true }),
    prisma.maintenanceRecord.createMany({ data: maintenance, skipDuplicates: true }),
    prisma.demoUser.createMany({ data: users, skipDuplicates: true }),
    prisma.generalServicesIncident.createMany({ data: generalServicesIncidents, skipDuplicates: true }),
  ])
  console.log('Datos ficticios de Referencias Operativas, perfiles e incidentes técnicos cargados.')
} finally {
  await prisma.$disconnect()
}
