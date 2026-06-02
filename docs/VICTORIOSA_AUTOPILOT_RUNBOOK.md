# Victoriosa Autopilot Runbook

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Purpose

Operate Victoriosa Autopilot as a private product intelligence assistant. It
can discover mock/manual candidates, score commercial fit, queue review items
and import approved candidates as internal drafts only.

## Safe Discovery

Allowed sources:

- Mock provider data in the repository.
- Manual admin-entered candidates.
- Future APIs only after credentials are loaded outside chat and terms are
  approved.

Forbidden:

- Unauthorized scraping.
- Live supplier purchases.
- Live payments.
- Automatic product publication.
- Service-role keys in browser code.

## Candidate Review

1. Run Discovery under `/admin/autopilot/discovery`.
2. Review `/admin/autopilot/candidates`.
3. Filter by recommendation, category, provider, score, risk and status.
4. Open candidate detail.
5. Review profitability, viral, supplier, compliance, shipping and market fit
   scores.
6. Read strengths, weaknesses, warnings and blockers.
7. Optionally adjust suggested price; this only updates internal margin and
   writes an audit event.
8. Approve for draft, reject with reason or keep in review.

## Draft Import

Only candidates in `approved_for_draft` may be imported. Import creates a
`marketplace_products` row with:

- `publication_status='draft'`
- `compliance_status='needs_review'`
- `image_rights_status='needs_review'`

Drafts are not visible in the public catalog until a separate human review and
publication gate approves them.

## Security

- All admin/owner routes call `requireAdmin`.
- Anonymous users must not read Autopilot tables.
- Customers must not access `/admin` or `/owner`.
- RLS remains enabled and strict for Autopilot internal tables.
- Review events and logs remain internal.

## Checks

Run before any PR:

```powershell
npm run ci
npm run test:rls:static
npm run staging:check
npm run rls:smoke
git diff --check
```

Do not run Production deploy or promotion commands without explicit human
approval in a separate release cycle.

