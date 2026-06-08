export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(formatValue);
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (value === null || value === undefined) return [];
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(
      ([key, entry]) => `${key}: ${formatValue(entry)}`,
    );
  }
  return [String(value)];
}

export function getCandidateDetailLists(candidate: Record<string, unknown>) {
  const scoring = asRecord(candidate.scoring);
  const scoreBreakdown = asRecord(candidate.score_breakdown);

  return {
    explanation: toStringList(scoring.explanation ?? scoreBreakdown.explanation),
    strengths: toStringList(candidate.strengths),
    weaknesses: toStringList(candidate.weaknesses),
    warnings: toStringList(scoring.warnings ?? scoreBreakdown.warnings),
    blockers: toStringList(scoring.blockers ?? scoreBreakdown.blockers),
  };
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null) return "null";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "valor no serializable";
    }
  }
  return String(value);
}
