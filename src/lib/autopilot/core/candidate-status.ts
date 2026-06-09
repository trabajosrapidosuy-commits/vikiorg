import type { RiskAssessment } from "./types";

export type CoreCandidateStatus = "discovered" | "shortlisted" | "needs_review" | "rejected" | "approved" | "imported_draft" | "failed";

export function initialCandidateStatus(risk: RiskAssessment): CoreCandidateStatus {
  if (risk.recommendedAction === "reject") return "rejected";
  if (risk.recommendedAction === "approve_candidate") return "approved";
  return "needs_review";
}
