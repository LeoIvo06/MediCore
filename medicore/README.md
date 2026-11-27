# MediCore · Sprint 1

Demo funcional con React, Express, Prisma y PostgreSQL en Docker. La interfaz usa perfiles ficticios para recorrer las siete historias del sprint.

## Arrancar la demo

Abre Docker Desktop. Usa Node.js 22.12 o posterior dentro de la rama 22, o Node.js 24. Desde esta carpeta (`medicore`), abre dos terminales PowerShell.

**Terminal 1 · API y base de datos**

```powershell
Set-Location backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d --wait
npm.cmd ci
npm.cmd run db:migrate
npm.cmd run generate
npm.cmd run db:seed
npm.cmd run dev
```

**Terminal 2 · Interfaz**

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd run dev
```

Abre la URL de Vite, normalmente `http://127.0.0.1:5173`. La API está disponible en `http://127.0.0.1:3001/api/health`.

## Guion de la demo

| Recorrido | Qué mostrar |
| --- | --- |
| Enfermería → Ingeniería Biomédica (`HU-CM1`, `HU-MD1`) | Envía solo la ubicación y verifica que la selección se conserva. Completa con el monitor, envía y abre el mismo ID desde Biomédica. Muestra la ficha y el historial del activo. |
| Admisión → Soporte TI → Admisión (`HU-JR1`, `HU-TI1`, `HU-TI5`) | Prueba `ADM-02`, `ADM-03` y `ADM-04` y comprueba los rechazos. Envía con `ADM-01`. Abre el ID como TI, comprueba el tipo, síntoma, ubicación e IP y confirma dos veces. Vuelve a Admisión para verificar la primera hora. |
| Servicios Generales (`HU-JUR1`, `HU-JUR2`) | Revisa los activos de los pisos 1 y 3. En el piso 3 deben aparecer `0140`, `0141` y `0143` en ese orden. Abre `INC-2026-0141` para mostrar el tipo, la ubicación y el síntoma. Cambia a Soporte TI desde el detalle para ver la denegación. |

Usa **Perfil demo** para cambiar de rol. Los incidentes y acuses se guardan en PostgreSQL. En el navegador solo se conserva el perfil seleccionado.

Para la explicación técnica, sigue el registro de un reporte desde su controlador REST y el servicio de comandos hasta la fachada de Referencias Operativas y el adaptador Prisma de Incidencias.

## Pruebas técnicas

Desde `backend`, `npm.cmd test` ejecuta las pruebas de dominio y arquitectura. `npm.cmd run test:integration` ejecuta los recorridos HTTP y comprueba la persistencia al recrear un contenedor de PostgreSQL con un volumen temporal. Abre [demo.http](backend/demo.http) en VS Code con REST Client para repetir las peticiones en vivo.

Consulta la [estructura del backend](backend/README.md) y el [contrato de la API](docs/api/README.md).
