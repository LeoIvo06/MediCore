# MediCore

Aplicación web para el incremento del Sprint 1 del proyecto MediCore. El repositorio queda organizado como monorepo con frontend React y un backend Express organizado con DDD.

## Alcance del frontend inicial

- HU-CM1: registro de falla de equipo médico con equipo, ubicación y síntoma obligatorios.
- HU-JR1: alerta rápida a TI desde una estación con ubicación e IP, prioridad crítica y validación de los datos de referencia.
- HU-JUR1: bandejas filtrables, ordenadas por piso y prioridad.
- HU-JUR2 / HU-TI1: consulta del detalle del incidente y comprobación de acceso por perfil/área en la interfaz.
- HU-MD1: apertura de ficha técnica e historial de mantenimiento desde el incidente relacionado.
- HU-TI5: confirmación de recepción de alerta con fecha y hora idempotentes.

## Ejecutar el frontend

Requiere Node.js y npm. Desde `frontend/`:

```powershell
npm install
npm run dev
```

Para generar la versión de producción: `npm run build`. El proyecto fue creado con Vite, React, TypeScript, React Router, Tailwind CSS y Lucide.

## Estado de integración

El frontend usa datos de demostración guardados en `localStorage` para poder recorrer los flujos antes de implementar el backend. La [base del backend](backend/README.md) incluye Express, Prisma y PostgreSQL en Docker. La API comprueba la conexión, valida sesiones de demo y sirve los catálogos con permisos por perfil. Los flujos de incidencias se integrarán en los siguientes bloques.

Perfiles de prueba: Enfermería, Admisión, Servicios Generales, Soporte TI e Ingeniería Biomédica. Los datos son ficticios.
