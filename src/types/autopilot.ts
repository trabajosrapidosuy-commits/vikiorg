import type {
  AIDraft,
  AssetRightsStatus,
  AutopilotConnectorStatus,
  AutopilotRecommendation,
  ComplianceDecision,
  DiscoveryPayloadFormat,
  ProductCandidate as CoreProductCandidate,
  DiscoveryInput,
  DiscoveryRun,
  DiscoveryProvenance,
  PricingDecision,
  ProductCandidateStatus,
  ReviewEvent,
  ScoringDecision,
  SupplierConnector,
} from "@/lib/autopilot/core/types";

export type { AIDraft, AssetRightsStatus, AutopilotConnectorStatus, AutopilotRecommendation, ComplianceDecision, DiscoveryInput, DiscoveryPayloadFormat, DiscoveryProvenance, DiscoveryRun, PricingDecision, ProductCandidateStatus, ReviewEvent, ScoringDecision };

export type AutopilotConnector = SupplierConnector;

export interface CandidateScore {
  profitability: number;
  viral: number;
  compliance: number;
  logistics: number;
  supplier: number;
  total: number;
  explanation: string[];
  supplierReliability?: number;
  complianceRisk?: number;
  shipping?: number;
  marketFit?: number;
  brandFitScore?: number;
  riskScore?: number;
  contentQualityScore?: number;
  scoreBreakdown?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  warnings?: string[];
  blockers?: string[];
  recommendation?: AutopilotRecommendation;
  complianceDecision?: ComplianceDecision;
  pricing?: PricingDecision;
}

export interface ProductCandidate extends Omit<CoreProductCandidate, "score"> {
  score: CandidateScore;
}

export interface DiscoveryResult {
  status: "completed" | "needs_credentials";
  connector: AutopilotConnector;
  candidates: ProductCandidate[];
  message: string;
}
