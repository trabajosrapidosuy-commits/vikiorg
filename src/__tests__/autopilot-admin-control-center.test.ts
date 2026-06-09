import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("autopilot admin control center", () => {
  it("keeps the storefront free of private Autopilot links", () => {
    const header = read("src/components/SiteHeader.tsx");
    expect(header).not.toContain("/admin/autopilot");
    expect(header).not.toContain("/owner/autopilot");
  });

  it("protects the Autopilot layout and direct routes server-side", () => {
    const layout = read("src/app/admin/autopilot/layout.tsx");
    const middleware = read("src/middleware.ts");
    expect(layout).toContain("await requireAdmin()");
    expect(middleware).toContain('pathname.startsWith("/admin")');
    expect(middleware).toContain('pathname.startsWith("/owner")');
  });

  it("ships the requested admin-only routes", () => {
    const menuConfig = read("src/lib/autopilot/admin/control-center.ts");
    expect(menuConfig).toContain('href: "/admin/autopilot"');
    expect(menuConfig).toContain('href: "/admin/autopilot/candidates"');
    expect(menuConfig).toContain('href: "/admin/autopilot/review"');
    expect(menuConfig).toContain('href: "/admin/autopilot/drafts"');
    expect(menuConfig).toContain('href: "/admin/autopilot/runs"');
    expect(menuConfig).toContain('href: "/admin/autopilot/settings"');
    expect(menuConfig).toContain('href: "/admin/autopilot/security"');
  });

  it("keeps admin notes and draft imports review-only", () => {
    const detail = read("src/app/admin/autopilot/candidates/[id]/page.tsx");
    const actions = read("src/app/admin/autopilot/actions.ts");
    const service = read("src/services/autopilot-persistence-service.ts");
    expect(detail).toContain("Agregar nota admin");
    expect(actions).toContain("addPersistentCandidateAdminNote");
    expect(service).toContain('review_status !== "approved_for_draft"');
    expect(service).toContain("Automatic publication remains disabled.");
  });

  it("documents strict safety flags in the security screen", () => {
    const security = read("src/app/admin/autopilot/security/page.tsx");
    expect(security).toContain("Publicacion automatica");
    expect(security).toContain("Proveedores live");
    expect(security).toContain("Fixtures persistentes");
    expect(security).toContain("requireAdmin");
  });
});
