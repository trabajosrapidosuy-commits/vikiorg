# Cycle Victoriosa Production Autodeploy Block Strategy

## Mode

`VICTORIOSA_PRODUCTION_AUTODEPLOY_BLOCK_STRATEGY`

## Context

- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-git-upload-repair`
- HEAD before cycle: `530169a`
- PR #25: `OPEN_DRAFT`
- PR checks: `PASS`
- Preview: `PASS`
- `PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Evidence

GitHub deployment history shows that feature and PR commits create Preview
deployments while commits merged to `main` create Production deployments.
Three Vercel scopes have produced Preview statuses for the current PR:

- `akuma424-projects`
- `victoriosa-marketplace`
- `ads-42d98c21`

There is no remote branch named exactly `integration` or `staging`, and `main`
has no branch protection.

## Options Evaluated

| Option | Benefit | Risk | Decision |
| --- | --- | --- | --- |
| Keep draft and Preview only | Zero Production mutation | No merge path | Required now |
| Retarget to `integration` | Stable integration and Preview lane | Unsafe before Vercel audit | Preferred after gates |
| Keep `main` as Production | Minimal Git change | Every merge can deploy Production | Rejected |
| Pause all Vercel auto-deploy | Strong immediate stop | Removes Preview automation | Emergency fallback |
| Separate `production` branch | Explicit release boundary | Must update every Vercel project | Preferred |
| Protect `main` only | Prevents accidental merges | Does not change Vercel target | Required but insufficient |
| Release windows on `main` | Simple process | High operator-error risk | Not recommended |

## Recommended Model

- Feature branches merge into protected `integration`.
- Vercel treats feature branches and `integration` as Preview only.
- Protected `production` is the only Production Branch.
- Releases use a separate PR from `integration` to `production`.
- Production deployment requires explicit human authorization.
- `main` remains frozen until the migration is verified.

## Manual GitHub Procedure

1. Create `integration` from the current reviewed `main`.
2. Create `production` from the approved production baseline.
3. Protect `integration` with PRs, approval, conversation resolution, required
   Preview checks and required CI.
4. Protect `production` more strictly and block direct pushes.
5. Add a real repository CI workflow for guards, lint, typecheck, tests and
   build.
6. Keep PR #25 draft and based on `main` until Vercel verification succeeds.

## Manual Vercel Procedure

For each observed scope:

1. Open `Vercel Dashboard > Project > Settings > Git`.
2. Confirm the exact GitHub repository.
3. Record project ID, owner/scope and current Production Branch.
4. Set the Production Branch to `production`.
5. Confirm `integration` creates Preview only.
6. Review duplicate projects and disconnect unauthorized Git integrations only
   after human ownership review.
7. Do not alter Production environment variables, domains or aliases.
8. Do not use Promote, Production Redeploy or CLI.

## Verification Test

After the manual configuration:

1. Push a documentation-only commit to `integration`.
2. Wait for all Vercel checks.
3. Confirm every deployment environment is Preview.
4. Confirm GitHub records zero Production deployments for the SHA.
5. Confirm Preview smoke passes.
6. Only then retarget PR #25 to `integration` and repeat the release gate.

## GO Conditions

- All Vercel projects and scopes are known.
- `production` is the only Production Branch everywhere.
- `integration` is protected and Preview-only.
- Required CI and Vercel checks pass.
- Test SHA creates zero Production deployments.
- PR #25 remains clean and safe.

## NO-GO Conditions

- Unknown Vercel connection.
- `main` or `integration` triggers Production.
- Missing branch protection or required CI.
- Pending or failing checks.
- Secret, payment, RLS or publication risk.

## Safety

- Production touched: `NO`
- Productive deploy executed: `NO`
- Vercel modified: `NO`
- PR #25 merged or marked ready: `NO`
- Secrets exposed: `NO`
- `.env.local` committed: `NO`

## Result

`GO_STRATEGY_DOCUMENTED`

Release remains `NO-GO_BLOCKED_PRODUCTION_RISK` until the manual GitHub and
Vercel controls are applied and verified.
