# Victoriosa Autonomous Commerce Engine Decision Engine Phase

## Scope

- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-autopilot-decision-engine`
- Base commit: `2a32d07 fix(supabase): harden realtime function execute grants`
- Scope executed: decision engine only

## Implemented

1. Added explicit pipeline in `src/lib/autopilot/core/pipeline.ts`:
   - `normalize`
   - `compliance gate`
   - `pricing`
   - `scoring`
   - `recommendation`
   - `review`
2. Consolidated outputs:
   - `ComplianceDecision`
   - `PricingDecision`
   - `ScoringDecision`
3. Restricted recommendations to:
   - `approve_candidate`
   - `review`
   - `reject`
4. Compliance now acts as veto engine:
   - clear blockers or medical/regulatory claims => `reject`
   - provenance gaps or rights ambiguity => `review`
   - safe products can reach `approve_candidate`
5. Preserved import safety:
   - imported products remain `draft + needs_review`
   - no automatic publication

## Tests Added/Adjusted

- safe product => `approve_candidate`
- medical claim => `reject`
- insufficient commercial viability => `review`
- incomplete provenance => `review`
- no automatic publication
- import remains `draft + needs_review`

## Safety

- `PRODUCTION_STATUS=NO-GO_PRODUCTION`
- no deploy
- no staging remote
- no apply remote
- no live providers
- no AI real
- no alerts/sync/tracking/fulfillment
