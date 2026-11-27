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

Los endpoints de registro de reportes, alertas, bandejas, detalle y acuse se implementan en los siguientes bloques. La aplicación React todavía utiliza el repositorio local de demostración.
