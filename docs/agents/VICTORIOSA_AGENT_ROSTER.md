# Victoriosa Agent Roster

## Reglas globales

Todos los agentes trabajan solo en
`C:\victoriosa-autopilot-admin-control-center`.

- no trabajar en `C:\victoriosa-respalo` ni `C:\victoriosa-safe`
- no borrar carpetas permanentemente
- no produccion ni deploy
- no `vercel --prod`, `vercel promote` ni mutacion de Production env
- no imprimir secretos ni commitear `.env.local`
- no usar `service_role` en cliente ni relajar RLS
- no publicar productos automaticamente
- no afirmar representacion oficial de marcas
- target staging exclusivo: `ngliugfcwydnfbpalkpb`
- `PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Agentes

| Agente | Uso principal |
| --- | --- |
| `VICTORIOSA_DIRECTOR_AGENT` | Coordinar ciclos, prioridades, estado y handoff |
| `VICTORIOSA_SECURITY_GATEKEEPER` | Auditar secretos, produccion, permisos y gates |
| `VICTORIOSA_SUPABASE_RLS_AGENT` | Migraciones, RLS y smoke tests de staging |
| `VICTORIOSA_AUTOPILOT_KBEAUTY_AGENT` | Persistencia y seed K-beauty review-only |
| `VICTORIOSA_UX_BRAND_AGENT` | UX, contenido y coherencia visual de marca |
| `VICTORIOSA_RELEASE_MANAGER` | Checks, rama, PR y release NO-GO/GO |
| `VICTORIOSA_ARCHIVE_CLEANUP_AGENT` | Inventario y cuarentena reversible |

Antes de ejecutar, abrir el archivo del agente elegido en esta carpeta.
