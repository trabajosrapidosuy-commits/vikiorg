# Victoriosa Autopilot Status

## Current State

- Build: PASS
- Local Autopilot persistence: IMPLEMENTED
- Fase 0 worktree recovery: IMPLEMENTED
- Fase 1 safety flags: IMPLEMENTED via central config
- Fase 1 contract consolidation: IMPLEMENTED for flags, connectors, candidates, scoring, compliance, review events and AI drafts
- Fase 2 safe discovery connectors: IMPLEMENTED for `mock`, `manual` and `csv-json`
- Fase 2 provenance normalization: IMPLEMENTED in `raw_payload` and candidate contract
- Realtime function execute hardening: READY_LOCAL_ONLY
- Decision engine explicit pipeline: IMPLEMENTED_LOCAL
- Admin web panel `/admin/autopilot`: IMPLEMENTED_LOCAL_PREVIEW_READY
- Supabase admin web fallback: IMPLEMENTED_SAFE_MESSAGE
- Supabase public env hardening: IMPLEMENTED_LOCAL
- Supabase env diagnostic script: IMPLEMENTED_LOCAL
- K-beauty review-only research assets: IMPLEMENTED_LOCAL
- K-beauty local-only seed script: READY_DRY_RUN
- K-beauty local-only migration: READY_LOCAL_ONLY
- Automatic publication: DISABLED_BY_FLAG
- Live providers: DISABLED_BY_FLAG_NEEDS_CREDENTIALS
- Real fulfillment: DISABLED_BY_FLAG
- Supplier purchase: DISABLED_BY_FLAG
- Outbound email: DISABLED_BY_FLAG
- Alerts, sync, tracking and fulfillment sandbox: NOT_IMPLEMENTED_IN_THIS_PHASE

## Discovery

- Safe connectors enabled:
  - `mock`
  - `manual`
  - `csv-json`
- External connectors remain `needs_credentials` or `disabled` by flag:
  - `cj`
  - `aliexpress`
  - `alibaba`
  - `zendrop`
  - `dropi`
  - `autods`
  - `dsers`
- Provenance normalized and preserved:
  - `raw_payload`
  - `source_url`
  - `external_id`
  - `provider`
  - `supplier`
  - `price`
  - `shipping`
  - `stock`
  - `rating`
  - `image_rights`
  - `resale_rights`

## Decision Engine

- Explicit pipeline implemented:
  - `normalize`
  - `compliance gate`
  - `pricing`
  - `scoring`
  - `recommendation`
  - `review`
- Consolidated outputs:
  - `ComplianceDecision`
  - `PricingDecision`
  - `ScoringDecision`
- Recommendation values limited to:
  - `approve_candidate`
  - `review`
  - `reject`
- Import behavior unchanged:
  - `draft + needs_review`
  - never auto-publishes

## K-beauty Review-only Boundary

- Seed script:
  - `npm run seed:autopilot:kbeauty`
  - default mode: dry-run only
  - write mode requires explicit write flags and non-production target confirmation
- Allowed review states:
  - `pending_admin_review`
  - `needs_review`
  - `needs_supplier_validation`
- Allowed representation state:
  - `not_official`
- No path to `published`
- No path to official representation in this phase

## Safety Boundary

`PRODUCTION_STATUS=NO-GO_PRODUCTION`
