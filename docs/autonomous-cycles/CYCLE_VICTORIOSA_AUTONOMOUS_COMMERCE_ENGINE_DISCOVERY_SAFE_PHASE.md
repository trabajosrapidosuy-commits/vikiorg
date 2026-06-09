# Victoriosa Autonomous Commerce Engine Discovery Safe Phase

## Scope

- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-admin-control-center`
- Base commit: `5674dfc feat(autopilot): harden phase 1 safety contracts`
- Scope executed: `Fase 2` only

## Implemented

1. Formalized safe discovery connectors:
   - `mock`
   - `manual`
   - `csv-json`
2. Kept external connectors non-executable:
   - `cj`
   - `aliexpress`
   - `alibaba`
   - `zendrop`
   - `dropi`
   - `autods`
   - `dsers`
3. Extended the discovery contract with normalized provenance:
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
4. Reused the existing schema. No local migration was required because
   `autopilot_product_candidates` already persisted `raw_payload`, `source_url`,
   `provider`, `external_id`, pricing and supplier columns.
5. Kept imports review-only:
   - candidates remain `pending_admin_review`
   - draft import remains `draft + needs_review`
   - no discovery path publishes products

## Real / Mock / Stub

- Real in this phase:
  - contract-safe normalization
  - mock discovery
  - manual discovery
  - csv/json discovery parsing
  - provenance persistence mapping
- Mock-safe:
  - mock supplier catalog
- Stub / blocked by design:
  - live provider APIs
  - AI generation
  - alerts
  - sync
  - tracking
  - fulfillment

## Checks

- `npm run secret:scan`: PASS
- `npm run production:check`: PASS
- `npm run guard:no-production-deploy`: PASS
- `npm run test:rls:static`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run test`: PASS
- `npm run build`: PASS
- `npm run smoke:structure`: PASS
- `git diff --check`: PASS

Focused preflight also passed:

- `npm run test -- autopilot`

## Safety

- `PRODUCTION_STATUS=NO-GO_PRODUCTION`
- No deploy
- No remote migration
- No production mutation
- No live providers
- No payments
- No service-role on client
- No RLS relaxation
