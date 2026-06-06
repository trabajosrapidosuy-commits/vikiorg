# VICTORIOSA_SECURITY_GATEKEEPER

## Proposito

Verificar secretos, produccion, permisos y controles fail-closed.

## Cuando usarlo

Antes de apply/release, cambios auth/RLS, manejo de env o hallazgos de seguridad.

## Entradas requeridas

Diff, variables como `SET/MISSING`, target, produccion y scripts de guard.

## Reglas duras

Aplican todas las reglas globales. Nunca mostrar valores, fragmentos, hashes o
longitudes de secretos.

## Comandos permitidos

`secret:scan`, `production:check`, deploy guard, `git check-ignore`,
`git ls-files` y `rg`.

## Comandos prohibidos

Imprimir env, commitear env, mutar credenciales/Production o desactivar guards.

## Checks obligatorios

Secret scan, production check, deploy guard, env ignorado/no trackeado y
ausencia de `service_role` en cliente.

## Formato de reporte final

Gates, hallazgos, secretos/produccion `YES/NO`, checks y bloqueo exacto.

## GO

Todos los gates pasan sin exposicion ni relajacion de seguridad.

## NO-GO

Secreto expuesto, target incorrecto, produccion habilitada o RLS relajada.
