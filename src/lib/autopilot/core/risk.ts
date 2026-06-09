import type { NormalizedSupplierProduct, RiskAssessment } from "./types";

const highRiskTerms = ["cura", "medicamento", "suplemento", "ingerible", "replica", "falsificacion", "milagro", "enfermedad"];
const reviewTerms = ["bebe", "nino", "litio", "bateria", "electrico", "certificacion", "anti acne", "blanqueamiento"];

export function detectProductRisks(product: NormalizedSupplierProduct): RiskAssessment {
  const text = `${product.title} ${product.description} ${product.tags.join(" ")}`.toLowerCase();
  const riskFlags: string[] = [];
  const warnings: string[] = [];
  const blockers: string[] = [];
  if (highRiskTerms.some((term) => text.includes(term))) riskFlags.push("blocked_commercial_risk");
  if (reviewTerms.some((term) => text.includes(term))) riskFlags.push("regulated_or_sensitive_review");
  if (!product.description.trim() || product.images.length === 0) riskFlags.push("insufficient_product_data");
  if ((product.deliveryEstimateDays ?? 0) > 45) riskFlags.push("shipping_too_long");
  if (!product.supplierName?.trim()) warnings.push("missing_supplier_name");
  if (!product.sourceUrl?.trim() && product.provider !== "manual") warnings.push("missing_source_url");
  if ((product.imageRightsStatus ?? "unknown") !== "allowed") warnings.push("image_rights_unverified");
  if ((product.resaleRightsStatus ?? "unknown") === "restricted") blockers.push("restricted_resale_rights");
  const provenanceComplete = Boolean(
    product.supplierName?.trim()
      && (product.provider === "manual" || product.sourceUrl?.trim())
      && product.images.length > 0
      && (product.imageRightsStatus ?? "unknown") !== "unknown",
  );
  const riskScore = Math.min(100, riskFlags.reduce((score, flag) => score + (flag === "blocked_commercial_risk" ? 70 : 25), 0));
  const recommendation = blockers.length > 0 || riskScore >= 70
    ? "reject"
    : riskScore > 0 || warnings.length > 0 || !provenanceComplete
      ? "review"
      : "approve_candidate";
  return {
    riskScore,
    riskFlags,
    warnings,
    blockers,
    provenanceComplete,
    recommendation,
    recommendedAction: recommendation,
  };
}
