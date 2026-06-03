import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("autopilot admin queue UX", () => {
  it("exposes commercial filters without public publication actions", () => {
    const queue = read("src/app/admin/autopilot/candidates/page.tsx");
    expect(queue).toContain('name="recommendation"');
    expect(queue).toContain('name="minScore"');
    expect(queue).toContain('name="maxRisk"');
    expect(queue).toContain('name="provider"');
    expect(queue).not.toContain("publication_status");
  });

  it("keeps suggested price editing review-only", () => {
    const detail = read("src/app/admin/autopilot/candidates/[id]/page.tsx");
    const actions = read("src/app/admin/autopilot/actions.ts");
    expect(detail).toContain("Guardar precio sugerido");
    expect(detail).toContain("No cambia publicacion");
    expect(actions).toContain("updatePersistentCandidateSuggestedPrice");
  });
});
