# Arquitectura del Sprint 1

- `incidencias` posee incidencias, alertas rápidas y sus bandejas.
- `referencias-operativas` posee equipos, ubicaciones, síntomas y configuración de estaciones.
- Incidencias consume referencias mediante un contrato de lectura; no debe importar entidades o tablas internas del otro contexto.
- La UI agrupa las vistas por bounded context, y los datos compartidos de presentación quedan en `frontend/src/shared`.
