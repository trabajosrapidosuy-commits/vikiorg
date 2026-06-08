import { describe, expect, it } from "vitest";
import { getCandidateDetailLists } from "@/lib/autopilot/admin/candidate-detail";
import { mapAutopilotWebCandidate } from "@/services/autopilot-web-service";

describe("Autopilot candidate detail safety", () => {
  it("renders legacy candidates without scoring explanation arrays", () => {
    expect(
      getCandidateDetailLists({
        scoring: { warnings: ["pending_validation"], blockers: [] },
        strengths: null,
        weaknesses: "legacy-string",
      }),
    ).toEqual({
      explanation: [],
      strengths: [],
      weaknesses: ["legacy-string"],
      warnings: ["pending_validation"],
      blockers: [],
    });
  });

  it("accepts string, object, null and undefined detail formats", () => {
    expect(
      getCandidateDetailLists({
        scoring: {
          explanation: "manual review required",
          warnings: { regulatory: "pending", source: null },
        },
        strengths: { margin: 45 },
        weaknesses: undefined,
      }),
    ).toEqual({
      explanation: ["manual review required"],
      strengths: ["margin: 45"],
      weaknesses: [],
      warnings: ["regulatory: pending", "source: null"],
      blockers: [],
    });
  });

  it("identifies persisted K-beauty candidates as review-only", () => {
    const candidate = mapAutopilotWebCandidate({
      id: "candidate-id",
      review_status: "pending_admin_review",
      raw_payload: { source: "kbeauty_seed_review_only" },
    });

    expect(candidate.isKbeautyReviewOnly).toBe(true);
    expect(candidate.status).toBe("pending_admin_review");
  });
});
