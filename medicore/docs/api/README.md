# API del Sprint 1

Prefijo local `/api` en `http://127.0.0.1:3001`.

| Método y ruta | Acceso | Respuesta |
| --- | --- | --- |
| `GET /health` | Local | Estado de la API y PostgreSQL. |
| `POST /sesiones-demo` | Credenciales de demo (`userId`, `password`) | `201` con token, vencimiento y perfil. |
| `GET /sesiones-demo/actual` | Sesión de demo | Identidad y perfil de la sesión. |
| `GET /incidencias/opciones-reporte` | Enfermería | Catálogos de equipos, ubicaciones y síntomas. |
| `GET /referencias/estaciones/:id` | Admisión | Configuración de estación. `ip` y `location` pueden ser `null`. |
| `GET /referencias/equipos/:id` | Ingeniería Biomédica | Ficha e historial del activo. |

Envía `Authorization: Bearer <token>` en las rutas protegidas. `401` indica credenciales o sesión inválidas, `403` un perfil sin acceso y `404` un recurso inexistente.

### Incidencias de equipos

| Método y ruta | Acceso | Respuesta |
| --- | --- | --- |
| `POST /incidencias/equipos` | Enfermería | `201` con el incidente creado. `422` con `fields` para IDs vacíos o inválidos. |
| `GET /incidencias/equipos` | Ingeniería Biomédica | Bandeja con los incidentes registrados en PostgreSQL. |
| `GET /incidencias/equipos/:id` | Ingeniería Biomédica o quien envió el reporte | Detalle del incidente identificado como `INC-EQ-…`. |

El registro recibe `equipmentId`, `locationId` y `symptomId`. Express obtiene el reportante de la sesión. La ficha se consulta por el `equipmentId` devuelto por el incidente.

### Alertas de Admisión y Soporte TI

| Método y ruta | Acceso | Respuesta |
| --- | --- | --- |
| `GET /referencias/estaciones` | Admisión | Estaciones disponibles. |
| `POST /alertas-ti` | Admisión | `201` con la alerta crítica. `422` con `fields` si la estación no existe o carece de `location` o `ip`. |
| `GET /alertas-ti` | Admisión | Alertas enviadas por el usuario autenticado. |
| `GET /soporte-ti/alertas` | Soporte TI | Bandeja de alertas recibidas. |
| `GET /alertas-ti/:id` | Soporte TI o quien envió la alerta | Detalle técnico y acuse si está confirmado. |
| `PUT /alertas-ti/:id/acuse` | Soporte TI | `200` con el primer `acknowledgedAt`, incluso si se confirma otra vez. La alerta sigue abierta. |

El envío recibe `stationId`. La ubicación y la IP se consultan por la fachada ACL, y el reportante proviene de la sesión. El detalle omite la IP cuando el ticket no la tiene registrada.

Los endpoints de Servicios Generales se implementan en el bloque siguiente.
