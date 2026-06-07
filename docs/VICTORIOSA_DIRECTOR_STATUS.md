# Victoriosa Director Status

## Current Mode

`VICTORIOSA_PRODUCTION_AUTODEPLOY_BLOCK_STRATEGY`

## Context

- Worktree: `C:\victoriosa-autopilot-admin-control-center`
- Branch: `codex/victoriosa-git-upload-repair`
- HEAD before cycle: `530169a`
- Pull request: `#25`
- PR base: `main`
- PR state: `OPEN_DRAFT`
- PR checks: `PASS`
- `PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Current Risk

`BLOCKED_PRODUCTION_RISK`

GitHub deployment history consistently shows:

- feature and PR commits create Vercel Preview deployments;
- commits integrated into `main` create Vercel Production deployments;
- at least three Vercel scopes are connected to this repository;
- `main` has no branch protection;
- no remote test CI workflow is required before merge.

No remote branch named exactly `integration` or `staging` currently exists.
PR #25 must remain draft and must not be merged or retargeted yet.

## Recommended Strategy

Use a two-lane Git model:

1. `integration` is the normal merge target for reviewed work.
2. `production` is the only Vercel Production branch.
3. `main` remains frozen until every connected Vercel project is audited.
4. Feature branches and `integration` may create Preview deployments only.
5. Production changes require a separate PR from `integration` to `production`,
   explicit human authorization and a release window.
6. `PRODUCTION_STATUS=NO-GO_PRODUCTION` remains active until that authorization.

This is safer than merely retargeting PR #25 because a new branch alone does
not change Vercel Production settings. The branch and all connected Vercel
projects must be configured and verified as one controlled change.

## Manual GitHub Steps

Human execution only:

1. Create `integration` from the current reviewed `main`.
2. Create `production` from the current approved production baseline.
3. Add branch protection to `integration`:
   - require pull requests;
   - require at least one approval;
   - require conversation resolution;
   - require Vercel Preview checks;
   - require the repository CI workflow after it is added;
   - block force pushes and deletion.
4. Add stricter protection to `production`:
   - require pull requests from `integration`;
   - require explicit release approval;
   - block direct pushes, force pushes and deletion;
   - require all checks and resolved conversations.
5. Do not retarget PR #25 until the Vercel verification below passes.

## Manual Vercel Steps

Repeat these steps in every connected project/scope, currently observed as
`akuma424-projects`, `victoriosa-marketplace` and `ads-42d98c21`:

1. Open Vercel Dashboard, select the project, then open `Settings > Git`.
2. Confirm the connected repository is exactly
   `trabajosrapidosuy-commits/Victoriosa-marketplace`.
3. Record the current Production Branch and project owner/scope.
4. Change the Production Branch from `main` to `production`.
5. Confirm `integration` and feature branches remain Preview-only.
6. If the project is a duplicate or unauthorized connection, disconnect its Git
   integration only after a human ownership review.
7. Keep Production environment variables unchanged.
8. Do not use Promote, Redeploy to Production, rollback, alias mutation or CLI.
9. Push a documentation-only test commit to `integration`.
10. Confirm each connected project creates Preview only and that GitHub records
    zero Production deployments for that SHA.

Vercel also supports disabling automatic deployments globally or per branch,
but that is a fallback. It can hide useful Preview feedback and does not solve
the multiple-project ownership problem by itself.

## Strategy Comparison

### Keep PR #25 draft and use Preview only

- Pros: zero Production risk now; already proven.
- Cons: does not provide an integration path.
- Decision: required immediate state.

### Retarget PR #25 to `integration`

- Pros: enables controlled merge and stable Preview branch.
- Cons: unsafe until `integration` exists and all Vercel scopes prove
  Preview-only.
- Decision: preferred after manual setup and verification.

### Keep `main` as Production with release windows

- Pros: minimal branch changes.
- Cons: every merge remains a Production trigger; high operator-error risk.
- Decision: rejected while `NO-GO_PRODUCTION` is active.

### Disable Vercel auto-deploy entirely

- Pros: strongest immediate deployment stop.
- Cons: also disables useful Preview automation and requires manual deployment
  discipline.
- Decision: emergency fallback, not preferred steady state.

### Separate `production` from `main`

- Pros: explicit release boundary and compatible with Preview-based review.
- Cons: requires synchronized configuration across every Vercel project.
- Decision: preferred Production boundary.

### Branch protection only

- Pros: prevents accidental GitHub merges.
- Cons: does not stop an authorized merge from triggering Vercel Production.
- Decision: mandatory defense in depth, insufficient alone.

## GO Conditions For PR #25

PR #25 may be retargeted to `integration` and marked ready only when:

- `integration` exists and is protected;
- every connected Vercel project is inventoried;
- every project uses `production` as its Production Branch or is disconnected;
- one test push to `integration` creates Preview deployments only;
- GitHub records zero Production deployments for the test SHA;
- required remote CI exists and passes;
- PR checks are green and merge state is clean;
- `.env.local` remains ignored and untracked;
- `PRODUCTION_STATUS=NO-GO_PRODUCTION` remains unchanged.

## NO-GO Conditions

- any Vercel project or scope remains unidentified;
- `main` or `integration` remains a Production Branch anywhere;
- a test push creates any Production deployment;
- branch protection or required CI is missing;
- PR checks fail or remain pending;
- a secret, RLS relaxation, payment or automatic publication risk appears.

## Safety

- Production touched: `NO`
- Productive deploy executed: `NO`
- Vercel modified: `NO`
- GitHub branch or PR base modified: `NO`
- PR #25 draft preserved: `YES`
- Secrets exposed: `NO`
- Products published: `NO`
- Official brand representation asserted: `NO`

## Decision

`GO_STRATEGY_DOCUMENTED`

Operational release remains:

`NO-GO_BLOCKED_PRODUCTION_RISK`

## NEXT_CODEX_PROMPT

Repository: `C:\victoriosa-autopilot-admin-control-center`

Branch: `codex/victoriosa-git-upload-repair`

Mode: `VICTORIOSA_MANUAL_VERCEL_SCOPE_AUDIT_PREP`

Objective: prepare a read-only inventory worksheet for every Vercel scope and
project connected to this repository, then record human-verified Production
Branch settings without modifying Vercel, GitHub branches or PR #25.

Rules:

- Keep PR #25 draft.
- Do not merge or retarget.
- Do not create Production deployments.
- Do not modify Vercel or Production environment variables.
- Never print secrets.

Checks:

- PR state and checks;
- GitHub deployment history;
- `.env.local` ignored and untracked;
- secret and production guards;
- documentation diff check.
