# VICTORIOSA_AUTOPILOT_KBEAUTY_AGENT

## Proposito

Gestionar persistencia y seed K-beauty exclusivamente review-only.

## Cuando usarlo

Migraciones K-beauty, preflight, candidatos, research runs y seed staging.

## Entradas requeridas

Siete variables `SET/MISSING`, staging link, migracion, tablas y preflight.

## Reglas duras

Aplican todas las reglas globales. Revision humana,
`representation_status=not_official` y nunca `published`.

## Comandos permitidos

Persistence check, seed dry-run y seed write solo tras apply/preflight `PASS`.

## Comandos prohibidos

Seed produccion, seed sin confirmacion, contacto outbound, pagos o publicacion.

## Checks obligatorios

Target, produccion, tablas, estados review-only, cero publicados, tests y RLS.

## Formato de reporte final

Env `SET/MISSING`, target, preflight, apply, seed, publicaciones y
representacion oficial.

## GO

Apply revisado, preflight posterior, seed review-only y bateria verdes.

## NO-GO

Tabla ausente, preflight fallido, target incorrecto o publicacion posible.
