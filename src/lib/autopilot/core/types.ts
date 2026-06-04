export type SupplierCurrency = "USD" | "UYU";
export type AutopilotRecommendation = "approve_candidate" | "review" | "reject";
export type AutopilotConnectorStatus = "sandbox" | "enabled" | "disabled" | "needs_credentials";
export type ProductCandidateStatus = "pending_admin_review" | "approved" | "rejected" | "imported_to_draft" | "archived";
export type DiscoveryTargetMarket = "Uruguay" | "LATAM" | "global";
export type DiscoveryPayloadFormat = "csv" | "json";
export type AssetRightsStatus = "unknown" | "allowed" | "restricted";
export type ReviewEventType =
  | "discovered"
  | "scored"
  | "shortlisted"
  | "approved"
  | "rejected"
  | "imported_draft"
  | "note_added"
  | "risk_flag_added"
  | "needs_review";

export interface NormalizedSupplierProduct {
  provider: string;
  providerProductId?: string;
  providerVariantId?: string;
  sku?: string;
  supplierName?: string;
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
  imageRightsStatus?: AssetRightsStatus;
  resaleRightsStatus?: AssetRightsStatus;
  hasVideo?: boolean;
  freeShipping?: boolean;
  deliveryEstimateDays?: number;
  weight?: number;
  dimensions?: string;
  tags: string[];
  raw: Record<string, unknown>;
}

export interface DiscoveryProvenance {
  rawPayload: Record<string, unknown>;
  sourceUrl?: string;
  externalId?: string;
  provider: string;
  supplier: string;
  price: number;
  shipping: number;
  stock: number;
  rating?: number;
  imageRights: AssetRightsStatus;
  resaleRights: AssetRightsStatus;
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

export interface PricingDecision extends PricingResult {}

export interface ComplianceDecision {
  riskScore: number;
  riskFlags: string[];
  recommendation: AutopilotRecommendation;
  recommendedAction: "approve_candidate" | "needs_review" | "reject";
}

export type RiskAssessment = ComplianceDecision;

export interface ScoringDecision {
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
  recommendedAction: ComplianceDecision["recommendedAction"];
  recommendation: AutopilotRecommendation;
  pricing: PricingDecision;
}

export type CandidateScoreResult = ScoringDecision;

export interface SupplierConnector {
  id: string;
  name: string;
  type: string;
  status: AutopilotConnectorStatus;
  capabilities: string[];
  requiredEnvVars: string[];
}

export interface DiscoveryInput {
  connectorId: string;
  category?: string;
  keyword?: string;
  minimumMarginPercent?: number;
  maximumSupplierPrice?: number;
  targetMarket?: DiscoveryTargetMarket;
  maximumShippingDays?: number;
  maximumResults?: number;
  title?: string;
  description?: string;
  supplierName?: string;
  sourceUrl?: string;
  imageUrl?: string;
  buyPrice?: number;
  shippingCost?: number;
  inventoryTotal?: number;
  verifiedInventory?: number;
  rating?: number;
  imageRightsStatus?: AssetRightsStatus;
  resaleRightsStatus?: AssetRightsStatus;
  payloadText?: string;
  payloadFormat?: DiscoveryPayloadFormat;
}

export interface ProductCandidate {
  id: string;
  connectorId: string;
  provider: string;
  externalId?: string;
  supplierName: string;
  title: string;
  description: string;
  category: string;
  sourceUrl: string;
  imageUrl?: string;
  supplierCost: number;
  shippingCost: number;
  currency: SupplierCurrency;
  inventoryTotal?: number;
  verifiedInventory?: number;
  estimatedDeliveryDays: number;
  suggestedSalePrice: number;
  estimatedMarginPercent: number;
  rating?: number;
  imageRightsStatus: AssetRightsStatus;
  resaleRightsStatus: AssetRightsStatus;
  rawPayload: Record<string, unknown>;
  provenance: DiscoveryProvenance;
  score: ScoringDecision;
  riskFlags: string[];
  status: ProductCandidateStatus;
}

export interface DiscoveryRun {
  id: string;
  connectorId: string;
  status: "pending" | "running" | "completed" | "needs_credentials" | "failed";
  filters: Record<string, unknown>;
  query?: string;
  category?: string;
  targetMarket?: DiscoveryTargetMarket;
  startedAt?: string;
  completedAt?: string;
}

export interface AIDraft {
  title: string;
  subtitle: string;
  benefits: string[];
  socialCaption: string;
  whatsappText: string;
  emailSubject: string;
  emailPreview: string;
  emailBody: string;
  safetyNotice: string;
}

export interface ReviewEvent {
  candidateId: string;
  eventType: ReviewEventType;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}
