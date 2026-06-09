import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260607025035_harden_legacy_public_policies_and_anon_grants.sql",
  ),
  "utf8",
);

describe("legacy public policy hardening", () => {
  it("constrains public intake without weakening catalog visibility", () => {
    expect(migration).toContain('create policy "click events constrained public insert"');
    expect(migration).toContain("product.publication_status = 'published'");
    expect(migration).toContain("product.compliance_status = 'approved'");
    expect(migration).toContain("product.risk_level = 'low'");
    expect(migration).toContain('create policy "consultations constrained public insert"');
    expect(migration).toContain("and status = 'submitted'");
    expect(migration).toContain("and admin_notes is null");
    expect(migration).not.toMatch(/with check\s*\(\s*true\s*\)/i);
  });

  it("keeps Autopilot anonymous access revoked and RLS enabled", () => {
    for (const table of [
      "autopilot_research_runs",
      "autopilot_brand_candidates",
      "autopilot_supplier_contacts",
      "autopilot_import_requirements",
    ]) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
      expect(migration).toContain(`revoke all on public.${table} from anon;`);
    }
  });

  it("revokes role disclosure while retaining the policy-safe boolean helper", () => {
    expect(migration).toContain(
      "revoke execute on function private.current_app_role() from anon;",
    );
    expect(migration).toContain(
      "grant execute on function private.is_marketplace_admin() to anon, authenticated;",
    );
    expect(migration).toContain("set search_path = ''");
  });
});
