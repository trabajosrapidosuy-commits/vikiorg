import { describe, expect, it } from "vitest";
import { createAutopilotCandidateRow } from "@/services/autopilot-persistence-service";
import { listAutopilotConnectors, runProductDiscovery } from "@/services/autopilot-service";

describe("autopilot safe discovery phase", () => {
  it("preserves mock provenance and keeps review-only status", () => {
    const result = runProductDiscovery({ connectorId: "mock", maximumResults: 1 });
    expect(result.status).toBe("completed");
    const candidate = result.candidates[0];
    expect(candidate.provider).toBe("mock");
    expect(candidate.status).toBe("pending_admin_review");
    expect(candidate.provenance.provider).toBe("mock");
    expect(candidate.provenance.sourceUrl).toMatch(/^https:\/\/example\.invalid\//);
    expect(candidate.imageRightsStatus).toBe("allowed");
    expect(candidate.resaleRightsStatus).toBe("unknown");
  });

  it("creates a manual candidate with normalized provenance and no publication path", () => {
    const result = runProductDiscovery({
      connectorId: "manual",
      title: "Set beauty facial",
      description: "Accesorio visual de autocuidado facial para demo controlada.",
      category: "Beauty",
      supplierName: "Proveedor manual",
      buyPrice: 9,
      shippingCost: 2,
      inventoryTotal: 8,
      verifiedInventory: 4,
      rating: 4.4,
      imageRightsStatus: "allowed",
      resaleRightsStatus: "restricted",
    });
    expect(result.status).toBe("completed");
    const candidate = result.candidates[0];
    expect(candidate.provider).toBe("manual");
    expect(candidate.supplierName).toBe("Proveedor manual");
    expect(candidate.provenance.supplier).toBe("Proveedor manual");
    expect(candidate.provenance.rating).toBe(4.4);
    expect(candidate.provenance.imageRights).toBe("allowed");
    expect(candidate.provenance.resaleRights).toBe("restricted");
    expect(candidate.status).toBe("pending_admin_review");
  });

  it("creates csv-json candidates and preserves raw payload", () => {
    const payload = JSON.stringify([
      {
        title: "Serum organizer",
        description: "Organizador premium para skincare",
        category: "Beauty",
        supplier: "Proveedor CSV",
        source_url: "https://example.invalid/csv-serum",
        external_id: "csv-1",
        price: 7.5,
        shipping: 1.5,
        stock: 22,
        rating: 4.8,
        image_rights: "allowed",
        resale_rights: "unknown",
      },
    ]);
    const result = runProductDiscovery({ connectorId: "csv-json", payloadText: payload, payloadFormat: "json", maximumResults: 5 });
    expect(result.status).toBe("completed");
    const candidate = result.candidates[0];
    expect(candidate.provider).toBe("csv-json");
    expect(candidate.externalId).toBe("csv-1");
    expect(candidate.provenance.provider).toBe("csv-json");
    expect(candidate.provenance.supplier).toBe("Proveedor CSV");
    expect(candidate.provenance.price).toBe(7.5);
    expect(candidate.rawPayload.external_id).toBe("csv-1");
  });

  it("persists provenance inside raw_payload without promoting approval or publication", () => {
    const result = runProductDiscovery({ connectorId: "mock", maximumResults: 1 });
    const row = createAutopilotCandidateRow("run-id", result.candidates[0]);
    expect(row.review_status).toBe("pending_admin_review");
    expect(row.status).toBe("pending_admin_review");
    expect(row.provider).toBe("mock");
    expect(row.external_id).toBeDefined();
    expect(row.raw_payload).toMatchObject({
      provenance: {
        provider: "mock",
        imageRights: "allowed",
      },
      normalized_candidate: {
        imageRightsStatus: "allowed",
        resaleRightsStatus: "unknown",
      },
    });
  });

  it("keeps external providers disabled or credential-bound", () => {
    const blocked = listAutopilotConnectors()
      .filter((connector) => ["cj", "aliexpress", "alibaba", "zendrop", "dropi", "autods", "dsers"].includes(connector.id))
      .map((connector) => connector.status);
    expect(blocked.every((status) => status === "disabled" || status === "needs_credentials")).toBe(true);
  });
});
