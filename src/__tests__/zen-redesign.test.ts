import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Victoriosa zen visual redesign", () => {
  it("prefers approved Sofia hero assets without replacing her identity", () => {
    const home = read("src/app/page.tsx");
    const heroAsset = read("src/lib/brand/sofia-hero.ts");
    expect(home).toContain("getSofiaHeroAsset");
    expect(heroAsset).toContain("public/brand/sofia-victoria-hero.jpg");
    expect(heroAsset).toContain("public/brand/sofia-victoria-hero-mobile.jpg");
    expect(heroAsset).toContain("public/victoriosa-hero-editorial.png");
    expect(heroAsset).toContain("Sofía Victoria, fundadora de Victoriosa, en un ritual de belleza consciente");
    expect(home).not.toContain("stock");
    expect(home).not.toContain("modelo generica");
  });

  it("adds zen premium trust and guidance sections without medical claims", () => {
    const home = read("src/app/page.tsx");
    expect(home).toContain("RITUALES DE BELLEZA CONSCIENTE");
    expect(home).toContain("Seleccion curada");
    expect(home).toContain("Asesoria personalizada");
    expect(home).toContain("Experiencia profesional");
    expect(home).toContain("Sin promesas medicas");
    expect(home).not.toMatch(/\bcura\b/i);
    expect(home).not.toContain("resultado garantizado");
  });

  it("keeps the public header free of admin links", () => {
    const header = read("src/components/SiteHeader.tsx");
    expect(header).not.toContain('href="/admin"');
    expect(header).toContain("BELLEZA EN CALMA");
  });
});
