import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationFiles = [
  "20260531000100_victoriosa_marketplace_foundation.sql",
  "20260601000100_victoriosa_autopilot_foundation.sql",
  "20260601000200_victoriosa_autopilot_admin_boundary.sql",
  "20260602000300_victoriosa_email_auth_profiles_settings.sql",
  "20260602000400_victoriosa_profile_role_escalation_guard.sql",
  "20260602000500_victoriosa_supplier_agnostic_autopilot_core.sql",
  "20260604000100_victoriosa_realtime_function_execute_hardening.sql",
  "20260605000100_victoriosa_kbeauty_research_review_only.sql",
  "20260607025035_harden_legacy_public_policies_and_anon_grants.sql",
];

const migrations = migrationFiles.map((file) => ({
  file,
  sql: fs.readFileSync(path.join(process.cwd(), "supabase/migrations", file), "utf8"),
}));

describe("staging migration idempotency", () => {
  it("drops every named policy before recreating it", () => {
    for (const { file, sql } of migrations) {
      const policies = sql.matchAll(
        /create policy "([^"]+)"\s+on\s+([a-z0-9_.]+)/gi,
      );
      for (const policy of policies) {
        const [, name, table] = policy;
        const prefix = sql.slice(0, policy.index).replace(/\s+/g, " ");
        expect(
          prefix,
          `${file}: policy "${name}" must be dropped before recreation`,
        ).toContain(`drop policy if exists "${name}" on ${table}`);
      }
    }
  });

  it("guards other duplicate-prone schema objects", () => {
    const combined = migrations.map(({ sql }) => sql).join("\n");

    expect(combined).not.toMatch(/create\s+(?:unique\s+)?index(?!\s+if\s+not\s+exists)/i);
    expect(combined).not.toMatch(/create\s+table(?!\s+if\s+not\s+exists)/i);
    expect(combined).toContain(
      "drop trigger if exists on_auth_user_created_victoriosa on auth.users;",
    );
    expect(combined).toContain(
      "drop trigger if exists prevent_marketplace_profile_role_change on public.marketplace_profiles;",
    );
    expect(combined).toContain(
      "drop constraint if exists autopilot_product_candidates_research_status_check",
    );
    expect(combined).toContain("on conflict (id) do nothing");
  });

  it("keeps the reconciliation non-destructive", () => {
    const combined = migrations.map(({ sql }) => sql).join("\n");

    expect(combined).not.toMatch(/\bdrop\s+table\b/i);
    expect(combined).not.toMatch(/\bdrop\s+schema\b/i);
    expect(combined).not.toMatch(/\btruncate\b/i);
    expect(combined).not.toMatch(/\bdelete\s+from\b/i);
    expect(combined).not.toMatch(/disable\s+row\s+level\s+security/i);
  });
});
