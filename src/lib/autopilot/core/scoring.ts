import { evaluateBusinessRules } from "./business-rules";
import { scoreBrandFit } from "./brand-fit";
import { calculateSuggestedPrice } from "./pricing";
import { detectProductRisks } from "./risk";
import type { CandidateScoreResult, NormalizedSupplierProduct } from "./types";
import { estimateViralPotential } from "./viral";

export function scoreCandidate(product: NormalizedSupplierProduct): CandidateScoreResult {
  const business = evaluateBusinessRules(product);
  const risk = detectProductRisks(product);
  const pricing = calculateSuggestedPrice(product, { riskScore: risk.riskScore });
  const brand = scoreBrandFit(product);
  const viral = estimateViralPotential(product);
  const profitabilityScore = clamp(Math.round(pricing.estimatedMarginPercent * 1.4 - product.shippingCost * 2));
  const inventoryScore = clamp(product.verifiedInventory > 0 ? Math.min(100, 45 + product.verifiedInventory) : Math.min(40, product.inventoryTotal));
  const contentQualityScore = clamp(product.images.length * 15 + (product.description.length >= 80 ? 40 : 15));
  const logisticsScore = clamp(100 - (product.deliveryEstimateDays ?? 30) * 2 - product.shippingCost * 2);
  const supplierReliabilityScore = inventoryScore;
  const complianceRiskScore = risk.riskScore;
  const shippingScore = logisticsScore;
  const marketFitScore = brand.score;
  const finalScore = clamp(Math.round(
    profitabilityScore * 0.24 + inventoryScore * 0.14 + viral.score * 0.16 + brand.score * 0.18 +
    contentQualityScore * 0.1 + logisticsScore * 0.1 + (100 - risk.riskScore) * 0.08,
  ));
  const blockers = [...business.blockers, ...(risk.recommendedAction === "reject" ? risk.riskFlags : [])];
  const warnings = [...business.warnings, ...(risk.recommendedAction === "needs_review" ? risk.riskFlags : [])];
  const recommendation = blockers.length > 0 || risk.recommendedAction === "reject"
    ? "reject"
    : finalScore >= business.rules.minimumTotalScoreForApproval && pricing.estimatedMarginPercent >= business.rules.minimumMarginPercent
      ? "approve_candidate"
      : "review";
  const strengths = [
    ...(pricing.estimatedMarginPercent >= 35 ? ["Margen recomendado alcanzado"] : []),
    ...(inventoryScore >= 60 ? ["Inventario util para validacion comercial"] : []),
    ...brand.reasons,
    ...viral.reasons,
    ...business.boosts,
  ];
  const weaknesses = [
    ...(pricing.estimatedMarginPercent < 35 ? ["Margen debajo del minimo recomendado"] : []),
    ...(product.verifiedInventory === 0 ? ["Inventario no verificado"] : []),
    ...warnings,
    ...blockers,
  ];
  return {
    profitabilityScore, supplierReliabilityScore, complianceRiskScore, shippingScore, marketFitScore,
    inventoryScore, viralSignal: viral.score, brandFitScore: brand.score,
    contentQualityScore, riskScore: risk.riskScore, logisticsScore, finalScore,
    scoreBreakdown: {
      profitabilityScore, supplierReliabilityScore, complianceRiskScore, shippingScore, marketFitScore,
      inventoryScore, viralSignal: viral.score, brandFitScore: brand.score, contentQualityScore,
      riskScore: risk.riskScore, logisticsScore,
    },
    strengths, weaknesses, warnings, blockers, riskFlags: risk.riskFlags,
    recommendedAction: risk.recommendedAction, recommendation, pricing,
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
