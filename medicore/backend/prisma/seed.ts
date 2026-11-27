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
  ])
  console.log('Datos ficticios de Referencias Operativas y perfiles de demo cargados.')
} finally {
  await prisma.$disconnect()
}
