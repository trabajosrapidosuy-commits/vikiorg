import type { CandidateScoreResult, NormalizedSupplierProduct } from "./types";
import { evaluateDecisionEngine } from "./pipeline";

export function scoreCandidate(product: NormalizedSupplierProduct): CandidateScoreResult {
  return evaluateDecisionEngine(product).scoring;
}
