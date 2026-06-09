# Cycle: Victoriosa Autopilot Admin Exclusive Menu

Date: 2026-06-02

Mode: `VICTORIOSA_AUTOPILOT_ADMIN_EXCLUSIVE_MENU_AND_CONTROL_CENTER`

Branch: `codex/victoriosa-autopilot-admin-control-center`

## Goal

Create a private Autopilot control center for admin/owner users with a clear
menu, review-only workflow, drafts visibility, security status and stricter UX
signals around no automatic publication.

## Implemented

- Admin sidebar now exposes an exclusive `Autopilot` group with active-state
  navigation.
- Added `/admin/autopilot/review`, `/admin/autopilot/drafts` and
  `/admin/autopilot/security`.
- Expanded `/admin/autopilot` dashboard with operational summary and safety
  controls.
- Added candidate audit timeline and admin note action.
- Kept `requireAdmin()` and middleware boundary unchanged and strict.
- Preserved draft-only import path and no-publication guarantees.

## Safety

`PRODUCTION_STATUS=NO-GO_PRODUCTION`

- No Production deploy.
- No Production env mutation.
- No live providers.
- No live payments.
- No automatic publication.
- No secrets printed.
- No RLS relaxation.
