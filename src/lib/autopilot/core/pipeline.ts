import { evaluateBusinessRules } from "./business-rules";
import { scoreBrandFit } from "./brand-fit";
import { calculateSuggestedPrice } from "./pricing";
import { detectProductRisks } from "./risk";
import type { DecisionEngineOutput, NormalizedSupplierProduct, ScoringDecision } from "./types";
import { estimateViralPotential } from "./viral";

export function evaluateDecisionEngine(product: NormalizedSupplierProduct): DecisionEngineOutput {
  const business = evaluateBusinessRules(product);
  const compliance = detectProductRisks(product);
  const pricing = calculateSuggestedPrice(product, { riskScore: compliance.riskScore });
  const brand = scoreBrandFit(product);
  const viral = estimateViralPotential(product);

  const profitabilityScore = clamp(Math.round(pricing.estimatedMarginPercent * 1.4 - product.shippingCost * 2));
  const inventoryScore = clamp(product.verifiedInventory > 0 ? Math.min(100, 45 + product.verifiedInventory) : Math.min(40, product.inventoryTotal));
  const contentQualityScore = clamp(product.images.length * 15 + (product.description.length >= 80 ? 40 : 15));
  const logisticsScore = clamp(100 - (product.deliveryEstimateDays ?? 30) * 2 - product.shippingCost * 2);
  const supplierReliabilityScore = inventoryScore;
  const complianceRiskScore = compliance.riskScore;
  const shippingScore = logisticsScore;
  const marketFitScore = brand.score;
  const finalScore = clamp(Math.round(
    profitabilityScore * 0.24 + inventoryScore * 0.14 + viral.score * 0.16 + brand.score * 0.18 +
    contentQualityScore * 0.1 + logisticsScore * 0.1 + (100 - compliance.riskScore) * 0.08,
  ));

  const blockers = [...business.blockers, ...compliance.blockers, ...(compliance.recommendation === "reject" ? compliance.riskFlags : [])];
  const warnings = [...business.warnings, ...compliance.warnings, ...(compliance.recommendation === "review" ? compliance.riskFlags : [])];
  const recommendation = blockers.length > 0 || compliance.recommendation === "reject"
    ? "reject"
    : !compliance.provenanceComplete
      ? "review"
      : finalScore >= business.rules.minimumTotalScoreForApproval
          && pricing.estimatedMarginPercent >= business.rules.minimumMarginPercent
          && pricing.estimatedSellPrice >= business.rules.minimumSuggestedPrice
          && pricing.estimatedSellPrice <= business.rules.maximumSuggestedPrice
        ? "approve_candidate"
        : "review";

  const strengths = [
    ...(pricing.estimatedMarginPercent >= business.rules.minimumMarginPercent ? ["Margen recomendado alcanzado"] : []),
    ...(inventoryScore >= 60 ? ["Inventario util para validacion comercial"] : []),
    ...brand.reasons,
    ...viral.reasons,
    ...business.boosts,
  ];
  const weaknesses = [
    ...(pricing.estimatedMarginPercent < business.rules.minimumMarginPercent ? ["Margen debajo del minimo recomendado"] : []),
    ...(product.verifiedInventory === 0 ? ["Inventario no verificado"] : []),
    ...warnings,
    ...blockers,
  ];

  const scoring: ScoringDecision = {
    profitabilityScore,
    supplierReliabilityScore,
    complianceRiskScore,
    shippingScore,
    marketFitScore,
    inventoryScore,
    viralSignal: viral.score,
    brandFitScore: brand.score,
    contentQualityScore,
    riskScore: compliance.riskScore,
    logisticsScore,
    finalScore,
    scoreBreakdown: {
      profitabilityScore,
      supplierReliabilityScore,
      complianceRiskScore,
      shippingScore,
      marketFitScore,
      inventoryScore,
      viralSignal: viral.score,
      brandFitScore: brand.score,
      contentQualityScore,
      riskScore: compliance.riskScore,
      logisticsScore,
    },
    strengths,
    weaknesses,
    warnings,
    blockers,
    riskFlags: compliance.riskFlags,
    recommendedAction: recommendation,
    recommendation,
    complianceDecision: compliance,
    pricing,
  };

  return {
    compliance,
    pricing,
    scoring,
    recommendation,
    reviewStatus: "pending_admin_review",
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
