# Victoriosa Autopilot Product Intelligence And Admin Queue

Date: 2026-06-02

Mode: `VICTORIOSA_AUTOPILOT_PRODUCT_INTELLIGENCE_AND_ADMIN_QUEUE_RESUME`

Branch: `codex/victoriosa-autopilot-product-intelligence-resume`

## Scope

Resumed Autopilot product intelligence from the safe core-engine branch without
mixing custom-domain legal release commits.

## Changes

- Added deterministic Victoriosa business rules.
- Expanded scoring with supplier reliability, compliance risk, shipping,
  market fit, warnings, blockers and recommendation.
- Added admin queue filters for recommendation, category, provider, minimum
  score, maximum risk and shipping sort.
- Added candidate detail score cards, warnings, blockers and source visibility.
- Added review-only suggested price editing with margin recalculation and audit
  event.
- Added tests for commercial scoring and admin queue safety.
- Added `docs/VICTORIOSA_AUTOPILOT_RUNBOOK.md`.

## Safety

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

- No live providers enabled.
- No payments enabled.
- No public OAuth activation.
- No automatic publication.
- No scraping.
- No service-role client usage.
- No RLS relaxation.
- No persistent fixtures created.

## Evidence

- `npm run ci`: PASS, 16 test files, 50 tests.
- `npm run build`: PASS, 52 routes plus Middleware.
- `npm run secret:scan`: PASS.
- `npm run production:check`: PASS.
- `npm run guard:no-production-deploy`: PASS.
- `npm run test:rls:static`: PASS, 21 public tables.
- `npm run staging:check`: PASS.
- `npm run rls:smoke`: PASS, anonymous catalog boundary and 9 internal
  Autopilot tables verified with zero visible rows.
- `git diff --check`: PASS.
- Local anonymous `/admin/autopilot/candidates`: PASS, HTTP `307` to login.
- In-app browser smoke: CHECK_NOT_RUN_BROWSER_ATTACH_TIMEOUT; HTTP boundary
  evidence above was used instead.

## GO / NO-GO

GO for local PR review once checks are green.

NO-GO for Production, live providers, payments or automatic publication.
