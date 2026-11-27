# Desarrollo de MediCore

Lee primero [MEDICORE_ROADMAP.md](MEDICORE_ROADMAP.md). Contiene la referencia al prompt maestro, las fases autorizadas y el estado verificado. Consulta el informe académico al cambiar criterios o flujos.

- Conserva los bounded contexts de Incidencias y Referencias Operativas. Las consultas entre ellos pasan por la fachada ACL. Sigue la organización por capas de ULima Market.
- Trabaja únicamente en la fase autorizada. Reutiliza el stack y los componentes existentes. Registra los cambios y las pruebas sin repetir la auditoría.
- Mantén cambios enfocados y commits independientes. Solicita aprobación para iniciar fases nuevas y para publicar fuera de una autorización vigente.
- Conserva el dominio de Vercel, los permisos del servidor y la persistencia en PostgreSQL. Usa datos ficticios para verificar la demo.
