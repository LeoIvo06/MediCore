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
