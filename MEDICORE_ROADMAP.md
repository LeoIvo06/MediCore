# MediCore Free 1.0 · Roadmap

Actualizado el 27 de noviembre de 2026. Usar este registro junto con el prompt maestro y el [informe académico](https://docs.google.com/document/d/1etr_6PtUbpfG_d2xmF6k8bHj8tBumBabrCrJrvl_L20/edit?tab=t.0). El original del prompt se conserva en la carpeta de respaldo local. El acceso del conector al informe en vivo devolvió 403. El contraste académico se hizo con la copia local sincronizada del 26 de noviembre, capítulos 1–3.

## Respaldo anterior a Free

- Etiqueta [backup/medicore-2026-11-27-pre-free](https://github.com/LeoIvo06/MediCore/tree/backup/medicore-2026-11-27-pre-free), commit `d89fe3d`.
- Git bundle verificado y tres capturas de referencia en `Ing. Soft/MediCore respaldo 2026-11-27`. Para restaurar código usar la etiqueta o clonar el bundle en un directorio nuevo.
- [Despliegue anterior · Vercel](https://vercel.com/carlos-071e/medicore-demo/47BYkiYKHNGFyuocaMA5jsFXK8RE), ID `dpl_47BYkiYKHNGFyuocaMA5jsFXK8RE`. Para restaurar la versión publicada, promover ese despliegue tras autorización. La base de datos se comparte con la demo y este respaldo cubre código y presentación.

## Fase 00 · Auditoría y planificación

- **Validada técnicamente.** Git limpio y 9 pruebas de dominio y arquitectura aprobadas. Vercel entregaba la versión anterior como producción. Edge cargó el formulario y la bandeja con datos reales de demo en escritorio y móvil.
- **Base existente.** Node 24, React 19, Vite 8, Tailwind 4, Express 5, Prisma 7 y PostgreSQL. La demo tiene cinco perfiles ficticios, registro de fallas, alerta de Admisión, bandejas, ficha de equipo, acuse, resolución, notificaciones con lectura persistente, sonido y tema oscuro.
- **Estructura.** ULima Market separa `catalog` y `notifications` en capas y usa `shared` para infraestructura transversal. MediCore conserva `incidencias` y `referencias-operativas` como contextos del Sprint 1. La dependencia entre ambos pasa por `ExternalOperationalReferencesService` y `OperationalReferencesContextFacade`. Los avisos actuales pertenecen al ciclo de Incidencias. El frontend organiza pantallas por contexto y reutiliza `shared` para presentación.
- **Contrato académico.** Preservar HU-CM1, HU-JR1, HU-JUR1, HU-JUR2, HU-TI1, HU-MD1 y HU-TI5. El acuse mantiene abierta la alerta hasta una resolución explícita. HU-JUR1 documenta una vista de activos. La API conserva la consulta de activos por defecto, mientras la bandeja actual también muestra resueltos por decisión posterior. Alinear un filtro de activos y resueltos con el equipo en Fase 07A.
- **Decisión de arquitectura.** Seguir con Express, Prisma, Neon y Docker para desarrollo. Mantener contratos REST, sesión y permisos en servidor. La Fase 01 se limita a tokens, componentes visuales y sus consumidores existentes. Para el Sprint 2, separar el ciclo de la orden biomédica del estado del ticket y revisar el límite de Continuidad operativa con el equipo antes de agregar módulos.
- **Riesgos y brechas.** El selector autentica perfiles ficticios compartidos. Un login real y el aislamiento de datos se deben definir antes de una operación con usuarios reales. La campana usa SSE de duración acotada, conexión directa y fallback. Medir conexiones y solicitudes en Fase 14 antes de cambiar la implementación. Vercel sirve Vite y monta Express en una función con máximo configurado de 30 s. [Límites de Vercel Functions](https://vercel.com/docs/functions/limitations)

## Alcance por fase

| Fase | Prioridad y estado | Entrega o dependencia |
| --- | --- | --- |
| 00 · Auditoría y arquitectura | Alta · EN VALIDACIÓN | Contraste con informe y ULima Market, respaldo y línea base reproducible. |
| 01 · Sistema visual | Alta · APROBADA | Paleta, tipografía, espaciado, superficies, campos, botones, tablas y estados en los flujos existentes. Sin dependencias nuevas. |
| 02 · Marca y entrada | Media · APROBADA | Isotipo común y presentación breve, repetible desde Perfil demo. |
| 03 · Landing | NO NECESARIA | Retirada por decisión del usuario. La demo abre directamente. |
| 04–05 · Acceso y navegación | Según demo · PENDIENTE | Priorizar el acceso existente por perfil. El login público queda fuera de la exposición actual. |
| 06 · Control Center | Alta · EN VALIDACIÓN | Inicio y accesos rápidos existentes. Definir métricas autorizadas a partir de datos reales. |
| 07A–C · Incidencias | Alta · PENDIENTE | Formularios, bandejas y detalle existentes. Alinear filtro y planificar avances del Sprint 2. |
| 07D · Kanban | Baja · PENDIENTE | Opcional. Depende de transiciones acordadas. |
| 08–11 · Módulos, movimiento, accesibilidad y responsive | Media · PENDIENTE | Ficha y tema ya operativos. Revisar por módulo después de la validación visual. |
| 12A · Notificaciones | Media · PENDIENTE | Aviso, permiso, sonido, lectura individual y enlace ya implementados. Evaluar contador y lectura masiva. |
| 12B–E · Búsqueda, exportación, perfil y ayuda | Baja · PENDIENTE | Evaluar valor y necesidades de permisos. |
| 13 · Demo y onboarding | Media · PENDIENTE | Perfiles y guion existentes. Aislamiento y restablecimiento por definir. |
| 14–15 · Rendimiento y entrega | Alta · PENDIENTE | Medir primero. PWA opcional. QA integral al cerrar el producto. |
| 16 · Premium | RESERVADA | Fuera del alcance Free. |

## Forma de trabajo

El prompt maestro guía el desarrollo. La autorización expresa del usuario define el alcance activo. Documentar decisiones y pruebas aquí, limitar cada intervención a sus componentes y verificarla antes de otra fase. Solo el usuario marca una fase **APROBADA**. Mantener commits pequeños y separados, conservar los flujos y evitar migraciones o infraestructura salvo que la fase aprobada las requiera. Modelo eficiente, razonamiento Medium para diseño y verificación, High solo para decisiones complejas de arquitectura.

## Fase 01 · Entrega visual

- **APROBADA.** El usuario validó la demo. Se actualizaron las variables de tema y los estilos compartidos de títulos, tarjetas, campos, botones, estados y tablas. Las pantallas de Inicio, Reportar falla, Alerta rápida, Bandeja y Detalle consumen las mismas clases. El logo, el favicon y el modo oscuro carbón siguen siendo los de MediCore.
- **Decisión de diseño.** Priorizar la lectura y las acciones de trabajo. Formularios alineados con su título, controles de 44 px, acción primaria a todo el ancho en móvil, foco de teclado visible y transiciones que respetan movimiento reducido. Los modales y tooltips se incorporarán cuando un flujo los requiera.
- **Verificación local.** Build de producción completo y lint sin errores, con dos avisos preexistentes en el contexto de React y el encabezado. Edge comprobó formulario con catálogos, bandeja con datos, claro/oscuro, foco y ausencia de desbordamiento global a 360, 390, 768, 1024 y 1440 px.
- **Verificación en Vercel.** El commit 895c3f7 quedó publicado en el dominio actual. Edge verificó catálogos, campana, bandeja con datos, tema y foco. La ruta de salud confirmó PostgreSQL. La compilación informó avisos de auditoría de dependencias del backend. Revisar su alcance en la fase de estabilidad. [Despliegue verificado](https://vercel.com/carlos-071e/medicore-demo/85bfSoXCYLGVwHJD1iKbtDzME7wt)
- **Validación manual.** Como Enfermería abre Reportar falla. Como Servicios Generales abre la Bandeja. Alterna claro y oscuro y revisa los campos, los estados y el foco. Las capturas comparativas están junto al Git bundle.
- **Siguiente propuesta.** Fase 02, tras validación del usuario. Definir el alcance de marca antes de implementar Pulse o la entrada animada. Razonamiento Low o Medium.

## Fase 02 · Marca y animación de entrada

- **APROBADA.** El usuario validó la animación en la demo. Se usa el isotipo aprobado junto al nombre en el encabezado móvil, la barra lateral y la presentación. El favicon se conserva. Se añaden títulos por ruta y metadatos para compartir con un recurso existente.
- **MediCore Launch y Pulse.** Entrada de 880 ms, una vez por pestaña, con pulso SVG. El contenido sigue disponible mientras se muestra. En movimiento reducido aparece una versión estática que solo cambia de opacidad.
- **Repetición.** Desde **Perfil demo → Repetir animación de entrada**. La opción devuelve el foco al botón de perfil.
- **Pruebas locales.** El build pasó. Edge verificó inicio, recarga sin repetición, repetición manual, navegación, foco, tamaños de 360, 390 y 1440 px y movimiento reducido. Lint mantiene los dos avisos preexistentes.
- **Pruebas en Vercel.** Edge reprodujo la entrada con temas claro y oscuro y con movimiento reducido. Verificó la carga de catálogos, el favicon, el recurso para compartir y PostgreSQL. [Despliegue](https://vercel.com/carlos-071e/medicore-demo/PLjFUdRpct3Qv4UzYuuHUwyCtneS)
- **Siguiente fase.** La aprobación de la Fase 02 habilitó la landing pública.

## Fase 03 · Cierre de la landing

Retirada por decisión del usuario. La aplicación abre en el dominio raíz y conserva /demo y las rutas internas. El frontend deja de incluir la vista, sus estilos y la captura de la portada.

## Demo académica · Sprint 2

- **HU-TI3 · EN VALIDACIÓN.** Admisión crea una alerta con una estación habilitada. Soporte TI abre el mismo ticket y registra si la estación respondió y el resultado. PostgreSQL conserva el resultado, el autor de la sesión y la fecha. Si la estación no respondió, ambos perfiles ven la revisión presencial como siguiente acción. Guardar el diagnóstico conserva el estado y el acuse.
- **Estructura para la exposición.** Formulario `ITDiagnosisCard` → `PUT /api/alertas-ti/:id/diagnostico` → controlador y assembler REST → `ITAlertCommandService` → contrato `ITAlertRepository` → adaptador Prisma. El diagnóstico pertenece al mismo agregado `ITAlert`. El ACL de Referencias Operativas sigue atendiendo la configuración de estaciones en el registro original de la alerta.
- **Pruebas.** Build completo, 9 pruebas de dominio y arquitectura, y 8 resultados de integración HTTP con PostgreSQL en Docker. Se comprobó autorización, entradas inválidas, identidad del autor, estado abierto, persistencia tras reinicio y rechazo de cambios a un ticket resuelto.
- **Verificación en Vercel.** La raíz y /demo abren la aplicación. La captura de la landing dejó de servirse. Se creó la alerta ficticia INC-TI-000004 desde Admisión, se guardó el diagnóstico como Soporte TI en móvil y se confirmó la siguiente acción al recargar con ambos perfiles. [Despliegue](https://vercel.com/carlos-071e/medicore-demo/3bgJCurf4WfqUp3qEYrpLfqjFwxo)

## Enfoque de presentación

La entrega se centra en las siete historias del Sprint 1 y en mejoras demostrables del prompt maestro. HU-TI3 se conserva como extra opcional de la demo. HU-MD2, HU-CM2 y HU-JUR3 quedan fuera del alcance de esta presentación.

- **Centro de control · Fase 06, EN VALIDACIÓN.** Accesos por perfil, indicadores y actividad reciente en el inicio. Admisión y las áreas resolutoras consultan sus rutas autorizadas. Enfermería conserva el acceso de registro. Los totales se derivan de los registros obtenidos en cada sesión, sin métricas simuladas.
