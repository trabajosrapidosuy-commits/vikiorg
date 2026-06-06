# Victoriosa Realtime Function Execute Hardening

## Scope

- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-decision-engine`
- Scope executed: local-only security hardening for Supabase Advisor warnings

## Trigger

Advisor warnings reported these public functions as executable by
`anon/authenticated` while using `SECURITY DEFINER`:

- `public.autopilot_discovery_runs_realtime_broadcast()`
- `public.marketplace_orders_realtime_broadcast()`
- `public.marketplace_products_realtime_broadcast()`

## Implemented

1. Added local idempotent migration:
   - `20260604000100_victoriosa_realtime_function_execute_hardening.sql`
2. The migration revokes:
   - `ALL` from `public`
   - `EXECUTE` from `anon`
   - `EXECUTE` from `authenticated`
3. The migration resolves function signatures dynamically with `pg_proc`, so it
   remains safe even if overloads exist.
4. Extended `scripts/test-rls-static.mjs` so this hardening cannot disappear
   silently from the migration tree.

## Safety

- No remote apply
- No production mutation
- No RLS relaxation
- No realtime internal trigger logic changed in application code

## Checks

- `npm run secret:scan`: PASS
- `npm run production:check`: PASS
- `npm run test:rls:static`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run test`: PASS
- `npm run build`: PASS
- `git diff --check`: PASS
