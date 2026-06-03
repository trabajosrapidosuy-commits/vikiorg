export type SupplierCurrency = "USD" | "UYU";

export interface NormalizedSupplierProduct {
  provider: string;
  providerProductId?: string;
  providerVariantId?: string;
  sku?: string;
  sourceUrl?: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  niche: string;
  sourceCountry?: string;
  targetCountry: string;
  currency: SupplierCurrency;
  buyPrice: number;
  shippingCost: number;
  inventoryTotal: number;
  verifiedInventory: number;
  listedCount?: number;
  rating?: number;
  reviewsCount?: number;
  hasVideo?: boolean;
  freeShipping?: boolean;
  deliveryEstimateDays?: number;
  weight?: number;
  dimensions?: string;
  tags: string[];
  raw: Record<string, unknown>;
}

export interface PricingResult {
  buyPrice: number;
  shippingCost: number;
  landedCost: number;
  markupPercent: number;
  estimatedSellPrice: number;
  estimatedMarginPercent: number;
  estimatedProfit: number;
}

export interface RiskAssessment {
  riskScore: number;
  riskFlags: string[];
  recommendedAction: "approve_candidate" | "needs_review" | "reject";
}

export interface CandidateScoreResult {
  profitabilityScore: number;
  supplierReliabilityScore: number;
  complianceRiskScore: number;
  shippingScore: number;
  marketFitScore: number;
  inventoryScore: number;
  viralSignal: number;
  brandFitScore: number;
  contentQualityScore: number;
  riskScore: number;
  logisticsScore: number;
  finalScore: number;
  scoreBreakdown: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  warnings: string[];
  blockers: string[];
  riskFlags: string[];
  recommendedAction: RiskAssessment["recommendedAction"];
  recommendation: "reject" | "review" | "approve_candidate";
  pricing: PricingResult;
}
