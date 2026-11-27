# Backend de MediCore

Express y TypeScript para la API, Prisma para persistencia y PostgreSQL 17 en Docker Compose. El backend ofrece los catálogos de Referencias Operativas, sesiones de demo y `GET /api/health` para comprobar la conexión.

## Arranque local

Requiere Node.js 22.12+ (rama 22) o Node.js 24, npm y Docker con Compose. Abre Docker Desktop si lo utilizas. Desde `medicore/backend`, en PowerShell:

```powershell
# Copia la plantilla la primera vez.
if (!(Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d --wait
npm.cmd ci
npm.cmd run db:migrate
npm.cmd run dev
```

En otra terminal o desde el navegador, consulta `http://127.0.0.1:3001/api/health`. Devuelve HTTP 200 con `{"status":"ok","database":"connected"}` si puede consultar PostgreSQL, o HTTP 503 si la base no responde. Desde el directorio del backend, `npm.cmd run db:status` comprueba la migración y `npm.cmd run build` genera la versión que arranca con `npm.cmd start`.

La base escucha en `127.0.0.1:5433`. Si cambias el puerto o las credenciales, ajusta también `DATABASE_URL` en `.env`. Usa `docker compose stop` para detener la base y conservar los datos en el volumen.

## Estructura del backend

`src/app.ts` compone la aplicación y `src/server.ts` la inicia. El bloque 1 deja en `shared/interfaces/rest/HealthController.ts` el controlador de estado y en `shared/infrastructure/persistence/prisma` la conexión a PostgreSQL.

Como en ULima Market, cada bounded context se organiza por capas dentro de su propio directorio (`src/incidencias` o `src/referencias-operativas`):

| Ruta dentro del contexto | Responsabilidad |
| --- | --- |
| `domain/model`, `domain/repositories`, `domain/services` | Modelo, reglas de negocio y contratos de repositorios y servicios. |
| `application/internal/commandservices`, `application/internal/queryservices` | Casos de uso de escritura y consulta. |
| `infrastructure/persistence/prisma/adapters` | Adaptadores de repositorio y conversión entre dominio y persistencia. |
| `interfaces/rest`, `interfaces/rest/resources`, `interfaces/rest/transform` | Controladores, contratos HTTP y conversión entre HTTP y dominio. |
| `interfaces/acl` | Fachada pública de Referencias Operativas para las consultas de Incidencias. |

## Referencias Operativas y sesiones de demo

Con la base activa, aplica la migración, genera el cliente y carga los datos ficticios:

```powershell
npm.cmd run db:migrate
npm.cmd run generate
npm.cmd run db:seed
npm.cmd test
npm.cmd run dev
```

El seed se puede repetir y conserva los registros existentes. Las cuentas de prueba son ficticias y las sesiones duran una hora en la instancia de Express.

| Usuario | Perfil | Contraseña de demo |
| --- | --- | --- |
| `enfermeria` | Enfermería | `medicore-demo-cm` |
| `admision` | Admisión | `medicore-demo-jr` |
| `servicios-generales` | Servicios Generales | `medicore-demo-sg` |
| `soporte-ti` | Soporte TI | `medicore-demo-ds` |
| `biomedica` | Ingeniería Biomédica | `medicore-demo-md` |

Usa [demo.http](demo.http) para iniciar sesión y probar los catálogos, las estaciones, las fichas y los rechazos por permiso. El [contrato API](../docs/api/README.md) indica el perfil habilitado en cada ruta.

Incidencias usa `ExternalOperationalReferencesService` desde `application/internal/outboundservices/acl` y Referencias Operativas publica `OperationalReferencesContextFacade` en `interfaces/acl`. La prueba `ArchitectureTest` verifica este límite, la dirección de la dependencia y la separación de Prisma respecto del dominio.

## Reporte de equipo y ficha biomédica

Aplica las migraciones y carga los datos ficticios con los comandos anteriores. En otra terminal, desde `medicore/frontend`, ejecuta `npm.cmd ci` y `npm.cmd run dev`. Vite reenvía las peticiones `/api` al backend de desarrollo.

1. En **Perfil demo**, elige **Enfermería** y abre **Reportar falla**. Selecciona solo una ubicación y envía. Debes ver los campos faltantes y conservar la ubicación.
2. Completa el equipo y el síntoma, envía y anota el identificador `INC-EQ-…`.
3. Cambia a **Ingeniería Biomédica**, abre **Bandeja biomédica** y busca ese ID. En el detalle, abre **Ficha técnica** y comprueba que el historial corresponde al equipo reportado.

Las pantallas de este flujo inician la sesión de demo al consultar la API. Los datos de las incidencias de equipo se guardan en PostgreSQL. La bandeja y el detalle de Servicios Generales consultan PostgreSQL.

## Alertas y acuses de TI

1. Con la API y Vite activos, elige **Admisión** en **Perfil demo** y abre **Alerta rápida**. Intenta enviar con `ADM-02` (sin IP), `ADM-03` (sin ubicación) y `ADM-04` (sin ambos).
2. Envía con `ADM-01`. Cambia a **Soporte TI**, abre **Lista de incidentes** y busca el mismo ID `INC-TI-…`. El detalle muestra el tipo de falla, la ubicación, el síntoma y la IP registrada.
3. Pulsa **Confirmar recepción** y vuelve a pulsar el botón. Compara la fecha y hora y comprueba que el incidente sigue abierto. Vuelve a **Admisión** y abre el mismo ticket desde **Alertas enviadas** para ver su acuse.

## Servicios Generales

Aplica la migración y ejecuta el seed para disponer de los casos ficticios. En **Perfil demo → Servicios Generales → Lista de incidentes**, comprueba los grupos **Piso 1** y **Piso 3**. En el piso 3 aparecen `INC-2026-0140`, `INC-2026-0141` y `INC-2026-0143` en ese orden. El caso cerrado `INC-2026-0144` queda fuera de la bandeja.

Abre `INC-2026-0141` y verifica su tipo de problema, ubicación y síntoma. Las peticiones de [demo.http](demo.http) permiten verificar el mismo recorrido y la respuesta por falta de permisos.
