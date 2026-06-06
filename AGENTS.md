# Victoriosa — Codex Operating Rules

## Carpeta canónica obligatoria

Codex debe trabajar exclusivamente en:

`C:\victoriosa-autopilot-admin-control-center`

Antes de modificar cualquier archivo, ejecutar y verificar:

```powershell
pwd
git status --short --branch
git rev-parse --short HEAD
git remote -v
git worktree list
```

Si `pwd` no es exactamente `C:\victoriosa-autopilot-admin-control-center`, detenerse y reportar:

`NO-GO: WRONG_WORKTREE`

## Carpetas prohibidas para trabajo activo

No trabajar, modificar, migrar, instalar dependencias ni ejecutar scripts desde:

* `C:\victoriosa-respalo`
* `C:\victoriosa-safe`
* `C:\Victoriosa`
* cualquier otra carpeta duplicada o antigua de Victoriosa

Si aparecen carpetas duplicadas, solo inventariar o mover a cuarentena con autorización explícita. Nunca borrar permanentemente.

## Repo base / worktree

`C:\victoriosa` puede ser repo base o git common dir requerido por el worktree. No eliminarlo ni moverlo sin confirmar primero:

```powershell
git rev-parse --git-common-dir
git worktree list
```

Si el worktree activo depende de `C:\victoriosa`, conservarlo como:

`KEEP_REQUIRED_GIT_COMMON_DIR`

## Estado canónico del proyecto

El estado director oficial es:

`docs/VICTORIOSA_DIRECTOR_STATUS.md`

Antes de ciclos importantes, leerlo. Después de cambios relevantes, actualizarlo.

Los reportes de ciclos deben guardarse en:

`docs/autonomous-cycles/`

## Supabase staging autorizado

Target exclusivo staging:

`ngliugfcwydnfbpalkpb`

URLs esperadas:

`https://ngliugfcwydnfbpalkpb.supabase.co`

Variables esperadas solo como `SET/MISSING`, nunca imprimir valores:

* `SUPABASE_URL`
* `SUPABASE_SERVICE_ROLE_KEY`
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `AUTHORIZED_STAGING_TARGET`
* `PRODUCTION_STATUS`
* `SUPABASE_ACCESS_TOKEN`, solo cuando haga falta CLI

Valores obligatorios:

* `AUTHORIZED_STAGING_TARGET=true`
* `PRODUCTION_STATUS=NO-GO_PRODUCTION`

Si el target no coincide exactamente, detenerse.

## Producción bloqueada

Está prohibido:

* `vercel --prod`
* `vercel promote`
* mutar variables Production
* tocar PayPal live
* pagos reales
* deploy de producción

Producción debe permanecer:

`NO-GO_PRODUCTION`

## Seguridad

Nunca imprimir secretos, tokens, keys, prefijos, sufijos, hashes ni longitudes de secretos.

No commitear:

* `.env`
* `.env.local`
* `.env.*`
* archivos con service role
* tokens Supabase
* credenciales Vercel
* claves PayPal

Verificar siempre:

```powershell
git check-ignore -v .env.local
git ls-files --error-unmatch .env.local
```

`.env.local` debe estar ignorado y no trackeado.

## Autopilot / K-beauty

No crear productos `published`.

No afirmar representación oficial de marcas.

Todo seed K-beauty debe quedar en revisión humana / review-only.

No relajar RLS.

No usar `service_role` en cliente.

No ejecutar seed write si el preflight de persistencia falla.

## Reporte final obligatorio

Cada ciclo debe informar:

* carpeta actual
* rama
* HEAD corto
* remote
* target Supabase
* estado de variables solo `SET/MISSING`
* producción tocada: `NO`
* deploy ejecutado: `NO`
* secretos expuestos: `NO`
* productos publicados: `NO`
* representación oficial afirmada: `NO`
* checks con `PASS`, `FAIL` o `CHECK_NOT_RUN`
* estado final `GO` o `NO-GO` con bloqueo exacto

## Sistema de agentes Victoriosa

Antes de iniciar una tarea especializada, Codex debe revisar:

`docs/agents/VICTORIOSA_AGENT_ROSTER.md`

Debe elegir el agente que corresponda al alcance real y obedecer sus gates,
checks y condiciones `GO` / `NO-GO`.
