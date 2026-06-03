import { describe, expect, it } from "vitest";
import { scoreBrandFit } from "@/lib/autopilot/core/brand-fit";
import { evaluateBusinessRules, matchesPriorityCategory } from "@/lib/autopilot/core/business-rules";
import { createDraftProductRow } from "@/lib/autopilot/core/import-draft";
import { calculateSuggestedPrice } from "@/lib/autopilot/core/pricing";
import { detectProductRisks } from "@/lib/autopilot/core/risk";
import { scoreCandidate } from "@/lib/autopilot/core/scoring";
import type { NormalizedSupplierProduct } from "@/lib/autopilot/core/types";
import { estimateViralPotential } from "@/lib/autopilot/core/viral";
import { listMockSupplierProducts } from "@/lib/autopilot/providers/mock-provider";
import { createManualCandidate } from "@/lib/autopilot/providers/manual-provider";

const beautyProduct: NormalizedSupplierProduct = {
  provider: "manual", title: "Organizador beauty facial", description: "Organizador visual de maquillaje y autocuidado facial con demostracion simple.",
  images: ["https://example.invalid/a.jpg", "https://example.invalid/b.jpg", "https://example.invalid/c.jpg"],
  category: "Beauty", niche: "beauty", targetCountry: "UY", currency: "USD", buyPrice: 5, shippingCost: 1,
  inventoryTotal: 100, verifiedInventory: 80, listedCount: 400, reviewsCount: 120, hasVideo: true, tags: ["belleza"], raw: {},
};

describe("supplier agnostic autopilot core", () => {
  it("calculates profitable psychological pricing", () => {
    const result = calculateSuggestedPrice(beautyProduct);
    expect(result.estimatedMarginPercent).toBeGreaterThanOrEqual(35);
    expect(result.estimatedSellPrice.toString()).toMatch(/\.9$/);
  });

  it("penalizes high shipping in pricing markup", () => {
    const expensiveShipping = calculateSuggestedPrice({ ...beautyProduct, buyPrice: 4, shippingCost: 12 });
    const normalShipping = calculateSuggestedPrice(beautyProduct);
    expect(expensiveShipping.markupPercent).toBeLessThan(normalShipping.markupPercent);
  });

  it("scores profitable beauty inventory above low inventory", () => {
    expect(scoreCandidate(beautyProduct).finalScore).toBeGreaterThan(scoreCandidate({ ...beautyProduct, inventoryTotal: 1, verifiedInventory: 0 }).finalScore);
  });

  it("returns commercial intelligence aliases and recommendation", () => {
    const score = scoreCandidate(beautyProduct);
    expect(score.supplierReliabilityScore).toBe(score.inventoryScore);
    expect(score.complianceRiskScore).toBe(score.riskScore);
    expect(score.shippingScore).toBe(score.logisticsScore);
    expect(score.marketFitScore).toBe(score.brandFitScore);
    expect(score.recommendation).toBe("approve_candidate");
    expect(score.blockers).toEqual([]);
  });

  it("keeps risky or excluded products out of auto-approval", () => {
    const score = scoreCandidate({ ...beautyProduct, title: "Replica medicamento milagro", description: "Suplemento que cura enfermedad" });
    expect(score.recommendation).toBe("reject");
    expect(score.blockers.length).toBeGreaterThan(0);
  });

  it("documents Victoriosa category boosts and warnings", () => {
    expect(matchesPriorityCategory(beautyProduct)).toBe(true);
    const evaluation = evaluateBusinessRules({ ...beautyProduct, deliveryEstimateDays: 45, verifiedInventory: 0 });
    expect(evaluation.boosts).toContain("Categoria prioritaria para Victoriosa.");
    expect(evaluation.warnings).toContain("Envio lento para validacion comercial inicial.");
    expect(evaluation.warnings).toContain("Proveedor con inventario verificado debil o insuficiente.");
  });

  it("detects medical and ingestible risks", () => {
    const risk = detectProductRisks({ ...beautyProduct, title: "Suplemento milagro", description: "Medicamento que cura enfermedad" });
    expect(risk.riskFlags).toContain("blocked_commercial_risk");
    expect(risk.recommendedAction).toBe("reject");
  });

  it("rewards Victoriosa brand fit and penalizes mismatch", () => {
    expect(scoreBrandFit(beautyProduct).score).toBeGreaterThan(scoreBrandFit({ ...beautyProduct, title: "Repuesto motor industrial", description: "Gaming industrial" }).score);
  });

  it("finds visual viral signals", () => {
    expect(estimateViralPotential(beautyProduct).score).toBeGreaterThanOrEqual(70);
  });

  it("provides mock and manual providers without external credentials", () => {
    expect(listMockSupplierProducts().length).toBeGreaterThanOrEqual(6);
    expect(createManualCandidate({ title: "Set beauty", description: "Producto visual beauty", category: "Beauty", buyPrice: 4 }).status).toBe("needs_review");
  });

  it("accepts empty optional fields from the manual admin form", () => {
    expect(createManualCandidate({ title: "Set beauty", description: "Producto visual beauty", category: "Beauty", buyPrice: "4", imageUrl: "", sourceUrl: "" }).status).toBe("needs_review");
  });

  it("forces imports to remain draft and needs review", () => {
    const row = createDraftProductRow({ title: "Draft", risk_flags: [], image_urls: [] }, "user-id");
    expect(row.publication_status).toBe("draft");
    expect(row.compliance_status).toBe("needs_review");
  });
});
