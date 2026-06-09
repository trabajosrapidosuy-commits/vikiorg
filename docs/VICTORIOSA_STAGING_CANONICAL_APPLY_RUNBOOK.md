# Victoriosa Staging Canonical Apply Runbook

## Scope

- Repository: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-staging-enable`
- Authorized Supabase staging ref: `ngliugfcwydnfbpalkpb`
- Expected URL: `https://ngliugfcwydnfbpalkpb.supabase.co`
- Production status: `NO-GO_PRODUCTION`

This runbook prepares a future staging-only apply. It does not authorize an
apply by itself.

## Hard Stops

Stop before any write unless all conditions pass:

- current directory is the canonical worktree;
- branch and reviewed HEAD are explicitly recorded;
- all required variables report `SET`;
- both Supabase URLs match the authorized staging URL;
- `AUTHORIZED_STAGING_TARGET=true`;
- `PRODUCTION_STATUS=NO-GO_PRODUCTION`;
- `supabase migration list` matches the reviewed history;
- `db push --dry-run --include-all` lists exactly the nine reviewed migrations;
- no new destructive SQL, unsafe grant, RLS relaxation, payment, publication
  or secret appears;
- the apply cycle explicitly authorizes staging mutation.

Never use `--db-url` with `SUPABASE_URL`. It is an HTTPS API URL, not a
Postgres connection string.

## Reviewed Migration Order

1. `20260531000100_victoriosa_marketplace_foundation.sql`
2. `20260601000100_victoriosa_autopilot_foundation.sql`
3. `20260601000200_victoriosa_autopilot_admin_boundary.sql`
4. `20260602000300_victoriosa_email_auth_profiles_settings.sql`
5. `20260602000400_victoriosa_profile_role_escalation_guard.sql`
6. `20260602000500_victoriosa_supplier_agnostic_autopilot_core.sql`
7. `20260604000100_victoriosa_realtime_function_execute_hardening.sql`
8. `20260605000100_victoriosa_kbeauty_research_review_only.sql`
9. `20260607025035_harden_legacy_public_policies_and_anon_grants.sql`

The six remote-applied placeholder versions remain history markers and are not
listed as pending by the reviewed dry-run.

## Pre-Apply Procedure

```powershell
Get-Location
git status --short --branch
git branch --show-current
git rev-parse --short HEAD
git remote -v
git worktree list
node scripts/check-env-status.mjs
git check-ignore -v .env.local
git ls-files --error-unmatch .env.local
npx --yes supabase@2.105.0 link --project-ref ngliugfcwydnfbpalkpb
npx --yes supabase@2.105.0 migration list
npx --yes supabase@2.105.0 db push --dry-run --include-all
```

Compare the dry-run output byte-for-byte by migration name and order with the
reviewed list above. Any difference is `NO-GO_PLAN_DRIFT`.

## Apply Command

The following command is prohibited until a separate cycle explicitly
authorizes staging mutation:

```powershell
npx --yes supabase@2.105.0 db push --include-all
```

Do not run `migration repair`. Do not run a real push after a failed or changed
dry-run.

## Post-Apply Verification

Load staging aliases in the current process without printing values, then run:

```powershell
npm run staging:check
npm run rls:smoke
npm run check:kbeauty-persistence -- --target=staging
```

The anonymous smoke must verify all 13 internal Autopilot tables:

1. `autopilot_supplier_connectors`
2. `autopilot_discovery_runs`
3. `autopilot_product_candidates`
4. `autopilot_ai_product_drafts`
5. `autopilot_logs`
6. `autopilot_campaign_drafts`
7. `autopilot_marketing_opt_ins`
8. `autopilot_review_events`
9. `autopilot_settings`
10. `autopilot_research_runs`
11. `autopilot_brand_candidates`
12. `autopilot_supplier_contacts`
13. `autopilot_import_requirements`

Expected results:

- anonymous access exposes no internal Autopilot rows;
- public catalog exposes only `published`, `approved`, `low` products;
- all K-beauty persistence tables report `READY`;
- campaign `send_enabled` remains false;
- no product is created or changed to `published`;
- candidates remain review-only and not officially represented.

## Optional Review-Only Seed

Seed remains a separate write gate. Run it only after persistence readiness is
green and the apply cycle explicitly authorizes the seed:

```powershell
npm run seed:autopilot:kbeauty -- --write --target=staging --confirm-review-only
```

After seed, confirm:

- product candidates are `pending_admin_review`, `needs_review` or
  `needs_supplier_validation`;
- representation status is `not_official`;
- no marketplace product is `published`;
- no email, supplier outreach, payment or live campaign was triggered.

## Failure Handling

- If any migration fails, stop immediately and do not run seed.
- Supabase migrations have no automatic safe rollback.
- Do not manually revert schema objects from the dashboard.
- Prepare a reviewed, forward-only compensating migration for any correction.
- Before a real apply, confirm staging backup/snapshot availability through the
  authorized Supabase project controls.
- Record the failed migration, exact non-secret error and resulting migration
  history before deciding the compensating action.
- Never mark a failed partial apply as repaired with `migration repair` without
  a separate audited recovery plan.

## Final Gate

`GO_STAGING_APPLY` requires explicit staging-write authorization, an unchanged
dry-run, backup confirmation, all local checks green and no production risk.

Otherwise:

`NO-GO_STAGING_APPLY`
