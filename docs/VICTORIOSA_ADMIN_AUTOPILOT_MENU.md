# Victoriosa Admin Autopilot Menu

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

## Purpose

Expose a private Autopilot control center only for `admin` and
`marketplace_admin` users. The public storefront and customer accounts must not
discover or access these routes.

## Routes

- `/admin/autopilot`
- `/admin/autopilot/candidates`
- `/admin/autopilot/review`
- `/admin/autopilot/drafts`
- `/admin/autopilot/runs`
- `/admin/autopilot/settings`
- `/admin/autopilot/security`
- `/owner/autopilot` redirects authorized users to `/admin/autopilot`

## Menu Group

Group name: `Autopilot`

Items:

1. Dashboard
2. Candidatos
3. Revision
4. Drafts
5. Ejecuciones
6. Reglas
7. Seguridad

## Permissions

- `anon`: blocked by middleware and route guards
- `customer/authenticated`: blocked by `requireAdmin()`
- `admin` and `marketplace_admin`: allowed

## Flow

1. Discovery or manual import creates candidate rows.
2. Candidate remains in review-only state.
3. Human review approves, rejects, adds notes or sends back to review.
4. Import to draft creates internal product rows only with `draft` status.
5. Separate publication review remains mandatory.

## Guarantees

- No automatic publication.
- No live providers.
- No live payments.
- No unauthorized scraping.
- All control-center actions remain audited.
