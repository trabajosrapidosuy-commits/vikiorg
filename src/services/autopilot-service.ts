import { evaluateDecisionEngine } from "@/lib/autopilot/core/pipeline";
import type { DiscoveryProvenance, NormalizedSupplierProduct } from "@/lib/autopilot/core/types";
import { AUTOPILOT_FLAGS } from "@/lib/autopilot/config";
import { parseCsvJsonDiscoveryInput } from "@/lib/autopilot/providers/csv-json-provider";
import { createManualCandidate } from "@/lib/autopilot/providers/manual-provider";
import { listMockSupplierProducts } from "@/lib/autopilot/providers/mock-provider";
import type {
  AutopilotConnector,
  CandidateScore,
  DiscoveryInput,
  DiscoveryResult,
  ProductCandidate,
} from "@/types/autopilot";

const baseConnectors: AutopilotConnector[] = [
  { id: "mock", name: "Mock Connector", type: "mock", status: "sandbox", capabilities: ["product_search", "price_sync_simulation"], requiredEnvVars: [] },
  { id: "manual", name: "Manual Intake", type: "manual", status: "enabled", capabilities: ["product_search", "manual_review_queue"], requiredEnvVars: [] },
  { id: "csv-json", name: "CSV/JSON Import", type: "file_import", status: "enabled", capabilities: ["product_search", "batch_import"], requiredEnvVars: [] },
  { id: "cj", name: "CJdropshipping", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "price_sync", "order_fulfillment", "tracking_sync"], requiredEnvVars: ["CJ_DROPSHIPPING_API_KEY"] },
  { id: "aliexpress", name: "AliExpress", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "price_sync"], requiredEnvVars: ["ALIEXPRESS_API_KEY"] },
  { id: "alibaba", name: "Alibaba", type: "api", status: "needs_credentials", capabilities: ["product_search"], requiredEnvVars: ["ALIBABA_API_KEY"] },
  { id: "zendrop", name: "Zendrop", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "order_fulfillment", "tracking_sync"], requiredEnvVars: ["ZENDROP_API_KEY"] },
  { id: "dropi", name: "Dropi", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "order_fulfillment", "tracking_sync"], requiredEnvVars: ["DROPI_API_KEY"] },
  { id: "autods", name: "AutoDS", type: "api", status: "needs_credentials", capabilities: ["product_search", "inventory_sync", "price_sync"], requiredEnvVars: ["AUTODS_API_KEY"] },
  { id: "dsers", name: "DSers", type: "api", status: "needs_credentials", capabilities: ["product_search", "order_fulfillment"], requiredEnvVars: ["DSERS_API_KEY"] },
];

export function listAutopilotConnectors(): AutopilotConnector[] {
  return baseConnectors.map((connector) => ({
    ...connector,
    status: connector.type === "api" && !AUTOPILOT_FLAGS.liveConnectorsEnabled ? "disabled" : connector.status,
    capabilities: [...connector.capabilities],
    requiredEnvVars: [...connector.requiredEnvVars],
  }));
}

export function runProductDiscovery(input: DiscoveryInput): DiscoveryResult {
  const connectors = listAutopilotConnectors();
  const connector = connectors.find((item) => item.id === input.connectorId) ?? connectors[0];
  if (connector.status === "disabled") {
    return { status: "needs_credentials", connector, candidates: [], message: `${connector.name} esta deshabilitado por safety flags en esta fase.` };
  }
  if (connector.status === "needs_credentials") {
    return { status: "needs_credentials", connector, candidates: [], message: `${connector.name} requiere credenciales externas cargadas de forma segura.` };
  }

  const maximumResults = Math.max(1, Math.min(input.maximumResults ?? 10, 50));
  const products = getDiscoveryProducts(connector.id, input);
  const candidates = products
    .filter((item) => !input.category || item.category === input.category)
    .filter((item) => !normalizeKeyword(input.keyword) || `${item.title} ${item.description}`.toLowerCase().includes(normalizeKeyword(input.keyword)!))
    .filter((item) => item.buyPrice <= (input.maximumSupplierPrice ?? Number.POSITIVE_INFINITY))
    .filter((item) => (item.deliveryEstimateDays ?? 0) <= (input.maximumShippingDays ?? Number.POSITIVE_INFINITY))
    .map((item, index) => createCandidate(item, index, connector.id))
    .filter((item) => item.estimatedMarginPercent >= (input.minimumMarginPercent ?? 0))
    .slice(0, maximumResults);

  return { status: "completed", connector, candidates, message: `${candidates.length} candidatos creados en pending_admin_review.` };
}

export function getDemoCandidates(): ProductCandidate[] {
  return runProductDiscovery({ connectorId: "mock", maximumResults: 10 }).candidates;
}

export function calculateCandidateScore(input: {
  marginPercent: number;
  supplierCost: number;
  shippingCost: number;
  deliveryDays: number;
  viralPotential: number;
  riskFlags: string[];
}): CandidateScore {
  const profitability = clamp(Math.round(input.marginPercent * 1.35 - input.supplierCost * 0.8 - input.shippingCost));
  const viral = clamp(input.viralPotential);
  const compliance = input.riskFlags.length === 0 ? 92 : input.riskFlags.includes("blocked_commercial_risk") ? 0 : 45;
  const logistics = clamp(100 - input.deliveryDays * 2 - input.shippingCost * 2);
  const supplier = 58;
  const total = clamp(Math.round(profitability * 0.3 + viral * 0.22 + compliance * 0.22 + logistics * 0.16 + supplier * 0.1));
  return {
    profitability,
    viral,
    compliance,
    logistics,
    supplier,
    total,
    explanation: [
      `Margen estimado: ${input.marginPercent.toFixed(1)}%.`,
      `Entrega estimada: ${input.deliveryDays} dias.`,
      input.riskFlags.length === 0 ? "Sin alertas comerciales automaticas." : `Alertas: ${input.riskFlags.join(", ")}.`,
      "Todo candidato requiere revision humana antes de importarse o publicarse.",
    ],
  };
}

function getDiscoveryProducts(connectorId: string, input: DiscoveryInput): NormalizedSupplierProduct[] {
  if (connectorId === "manual") {
    return [createManualCandidate(input).product];
  }
  if (connectorId === "csv-json") {
    return parseCsvJsonDiscoveryInput(input);
  }
  return listMockSupplierProducts();
}

function createCandidate(item: NormalizedSupplierProduct, index: number, connectorId: string): ProductCandidate {
  const decision = evaluateDecisionEngine(item);
  const externalId = item.providerProductId ?? `${connectorId}-${index + 1}`;
  const provenance = createDiscoveryProvenance(item);
  return {
    id: `${connectorId}-candidate-${externalId}`.slice(0, 120),
    connectorId,
    provider: item.provider,
    externalId,
    supplierName: item.supplierName ?? supplierFallback(connectorId),
    title: item.title,
    description: item.description,
    category: item.category,
    sourceUrl: item.sourceUrl ?? "",
    imageUrl: item.images[0],
    supplierCost: item.buyPrice,
    shippingCost: item.shippingCost,
    currency: item.currency,
    inventoryTotal: item.inventoryTotal,
    verifiedInventory: item.verifiedInventory,
    estimatedDeliveryDays: item.deliveryEstimateDays ?? 0,
    suggestedSalePrice: decision.pricing.estimatedSellPrice,
    estimatedMarginPercent: decision.pricing.estimatedMarginPercent,
    rating: item.rating,
    imageRightsStatus: item.imageRightsStatus ?? "unknown",
    resaleRightsStatus: item.resaleRightsStatus ?? "unknown",
    rawPayload: { ...item.raw },
    provenance,
    score: {
      profitability: decision.scoring.profitabilityScore,
      viral: decision.scoring.viralSignal,
      compliance: 100 - decision.scoring.riskScore,
      logistics: decision.scoring.logisticsScore,
      supplier: decision.scoring.inventoryScore,
      supplierReliability: decision.scoring.supplierReliabilityScore,
      complianceRisk: decision.scoring.complianceRiskScore,
      shipping: decision.scoring.shippingScore,
      marketFit: decision.scoring.marketFitScore,
      total: decision.scoring.finalScore,
      explanation: [...decision.scoring.strengths, ...decision.scoring.weaknesses],
      brandFitScore: decision.scoring.brandFitScore,
      riskScore: decision.scoring.riskScore,
      contentQualityScore: decision.scoring.contentQualityScore,
      scoreBreakdown: decision.scoring.scoreBreakdown,
      strengths: decision.scoring.strengths,
      weaknesses: decision.scoring.weaknesses,
      warnings: decision.scoring.warnings,
      blockers: decision.scoring.blockers,
      recommendation: decision.recommendation,
      complianceDecision: decision.compliance,
      pricing: decision.pricing,
    },
    riskFlags: decision.scoring.riskFlags,
    status: decision.reviewStatus,
  };
}

function createDiscoveryProvenance(item: NormalizedSupplierProduct): DiscoveryProvenance {
  return {
    rawPayload: { ...item.raw },
    sourceUrl: item.sourceUrl,
    externalId: item.providerProductId,
    provider: item.provider,
    supplier: item.supplierName ?? "Proveedor no especificado",
    price: item.buyPrice,
    shipping: item.shippingCost,
    stock: item.verifiedInventory || item.inventoryTotal,
    rating: item.rating,
    imageRights: item.imageRightsStatus ?? "unknown",
    resaleRights: item.resaleRightsStatus ?? "unknown",
  };
}

function supplierFallback(connectorId: string): string {
  if (connectorId === "csv-json") return "Importacion CSV/JSON Victoriosa";
  if (connectorId === "manual") return "Carga manual Victoriosa";
  return "Proveedor sandbox Victoriosa";
}

function normalizeKeyword(keyword: string | undefined): string | undefined {
  const normalized = keyword?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
