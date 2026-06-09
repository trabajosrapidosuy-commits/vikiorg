# Cycle Report - VICTORIOSA_SUPABASE_LEGACY_POLICY_HARDENING_REVIEW

## Scope

- Repository: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-staging-enable`
- Starting HEAD: `8434823`
- Authorized staging target: `ngliugfcwydnfbpalkpb`
- Production: `NO-GO_PRODUCTION`

## Findings

| Source | Object | Role | Risk | Classification | Action |
| --- | --- | --- | --- | --- | --- |
| `20260531000100` | `marketplace_click_events` insert policy | public | Arbitrary rows via `with check (true)` | Legacy public intake | Replaced with user, source, metadata and publishable-product constraints |
| `20260531000100` | `beauty_consultations` insert policy | public | Internal fields writable via `with check (true)` | Legacy public intake | Restricted ownership, status, recommendations, notes and answer shape |
| `20260531000100` | `private.current_app_role()` | `anon` | Unnecessary role-returning helper execution | Legacy helper | Anonymous EXECUTE revoked |
| `20260531000100` | `private.is_marketplace_admin()` | `anon` | Boolean helper exposure | Required RLS helper | Retained because mixed public/admin policies must evaluate safely; no role data returned |

## Migration

Created:

`supabase/migrations/20260607025035_harden_legacy_public_policies_and_anon_grants.sql`

- Idempotent policy replacement uses `drop policy if exists`.
- Helper functions use an empty `search_path` and fully qualified references.
- No data deletion, table deletion, schema deletion or RLS relaxation.
- Public catalog remains limited to `published`, `approved`, `low`.

## Autopilot

The following tables have local RLS enable statements, strict admin policies
and explicit anonymous revokes:

- `autopilot_research_runs`
- `autopilot_brand_candidates`
- `autopilot_supplier_contacts`
- `autopilot_import_requirements`

The anonymous staging smoke now covers all 13 internal Autopilot tables.
These four return HTTP 404 because their migration has not been applied to
staging, so remote RLS validation remains pending.

## Validation

- SQL destructive patterns: `NO`
- RLS relaxed: `NO`
- Dangerous grants to `anon` remaining: `NO`
- Autopilot protected locally: `PASS`
- Public catalog preserved: `PASS`
- `db push --dry-run --include-all`: `PASS`, nine migrations listed
- Real `db push`: `NO`
- Seed: `NO`
- Production/deploy: `NO`

## Checks

- Env gate: `PASS`
- `npm run secret:scan`: `PASS`
- `npm run production:check`: `PASS`
- `npm run guard:no-production-deploy`: `PASS`
- `npm run test:rls:static`: `PASS`, 25 public tables
- `npm run lint`: `PASS`
- `npm run typecheck`: `PASS`
- `npm run test -- --run`: `PASS`, 30 files and 106 tests
- `npm run build`: `PASS`
- `npm run staging:check`: `PASS`
- `npm run rls:smoke`: `FAIL`, four pending K-beauty tables return HTTP 404
- `git diff --check`: `PASS`

## Decision

`GO_HARDENING_DRY_RUN_REVIEWABLE`

The hardening and migration plan are reviewable. Remote verification of the
four pending tables requires a separately authorized staging apply cycle.
