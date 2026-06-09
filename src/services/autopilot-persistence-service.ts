import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { generateCommercialDraft } from "./autopilot-marketing-service";
import { createDraftProductRow } from "@/lib/autopilot/core/import-draft";
import { normalizeSlug } from "./marketplace-product-service";
import { runProductDiscovery } from "./autopilot-service";
import type { DiscoveryInput, ProductCandidate } from "@/types/autopilot";

export const discoveryInputSchema = z.object({
  connectorId: z.string().min(1).default("mock"),
  category: emptyToUndefined(z.string().trim().min(2).max(80).optional()),
  keyword: emptyToUndefined(z.string().trim().max(120).optional()),
  minimumMarginPercent: z.coerce.number().min(0).max(95).default(25),
  maximumSupplierPrice: emptyToUndefined(z.coerce.number().positive().max(100000).optional()),
  targetMarket: z.enum(["Uruguay", "LATAM", "global"]).default("Uruguay"),
  maximumShippingDays: z.coerce.number().int().positive().max(120).default(45),
  maximumResults: z.coerce.number().int().positive().max(50).default(10),
  title: emptyToUndefined(z.string().trim().min(3).max(180).optional()),
  description: emptyToUndefined(z.string().trim().min(3).max(5000).optional()),
  supplierName: emptyToUndefined(z.string().trim().min(2).max(160).optional()),
  sourceUrl: emptyToUndefined(z.string().url().optional()),
  imageUrl: emptyToUndefined(z.string().url().optional()),
  buyPrice: emptyToUndefined(z.coerce.number().min(0).optional()),
  shippingCost: emptyToUndefined(z.coerce.number().min(0).optional()),
  inventoryTotal: emptyToUndefined(z.coerce.number().int().min(0).optional()),
  verifiedInventory: emptyToUndefined(z.coerce.number().int().min(0).optional()),
  rating: emptyToUndefined(z.coerce.number().min(0).max(5).optional()),
  imageRightsStatus: z.enum(["unknown", "allowed", "restricted"]).default("unknown"),
  resaleRightsStatus: z.enum(["unknown", "allowed", "restricted"]).default("unknown"),
  payloadText: emptyToUndefined(z.string().trim().min(2).optional()),
  payloadFormat: z.enum(["csv", "json"]).default("json"),
});

function emptyToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => value === "" ? undefined : value, schema);
}

export async function runPersistentProductDiscovery(supabase: SupabaseClient, userId: string, rawInput: unknown) {
  const input = discoveryInputSchema.parse(rawInput) satisfies DiscoveryInput;
  const { data: run, error: runError } = await supabase
    .from("autopilot_discovery_runs")
    .insert({
      status: "running",
      filters: input,
      query: input.keyword,
      category: input.category,
      country_target: input.targetMarket,
      min_margin: input.minimumMarginPercent,
      max_results: input.maximumResults,
      started_at: new Date().toISOString(),
      created_by: userId,
    })
    .select("id")
    .single();
  if (runError || !run) throw new Error(runError?.message ?? "Could not create discovery run");

  const result = runProductDiscovery(input);
  if (result.status === "needs_credentials") {
    await supabase.from("autopilot_discovery_runs").update({ status: "needs_credentials", completed_at: new Date().toISOString() }).eq("id", run.id);
    await logAutopilotEvent(supabase, { runId: run.id, level: "warning", message: result.message });
    return { runId: run.id, ...result };
  }

  const rows = result.candidates.map((candidate) => createAutopilotCandidateRow(run.id, candidate));
  const { error: candidatesError } = await supabase.from("autopilot_product_candidates").insert(rows);
  if (candidatesError) {
    await supabase.from("autopilot_discovery_runs").update({ status: "failed", error_message: candidatesError.message, completed_at: new Date().toISOString() }).eq("id", run.id);
    throw new Error(candidatesError.message);
  }

  await supabase.from("autopilot_discovery_runs").update({
    status: "completed",
    summary: { candidateCount: rows.length, connector: input.connectorId },
    completed_at: new Date().toISOString(),
  }).eq("id", run.id);
  await logAutopilotEvent(supabase, { runId: run.id, level: "info", message: `Discovery completed with ${rows.length} review-only candidates.` });
  return { runId: run.id, ...result };
}

export async function listPersistentCandidates(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("autopilot_product_candidates").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPersistentDiscoveryRuns(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("autopilot_discovery_runs").select("*").order("created_at", { ascending: false }).limit(20);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPersistentDraftImports(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("autopilot_product_candidates")
    .select("id,title,category,provider,supplier_name,suggested_price,margin_percent,review_status,imported_product_id,created_at,updated_at")
    .eq("review_status", "imported_to_products")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPersistentCandidateEvents(supabase: SupabaseClient, candidateId: string) {
  const id = z.string().uuid().parse(candidateId);
  const { data, error } = await supabase
    .from("autopilot_review_events")
    .select("*")
    .eq("candidate_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPersistentCandidate(supabase: SupabaseClient, id: string) {
  const candidateId = z.string().uuid().parse(id);
  const { data, error } = await supabase.from("autopilot_product_candidates").select("*").eq("id", candidateId).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function approvePersistentCandidate(supabase: SupabaseClient, id: string) {
  const candidate = await getPersistentCandidate(supabase, id);
  if (candidate.review_status === "blocked_no_publish" || candidate.risk_flags?.includes("blocked_commercial_risk")) {
    throw new Error("Blocked candidates cannot be approved for draft import");
  }
  return updateCandidateReview(supabase, id, { status: "approved", review_status: "approved_for_draft", rejection_reason: null }, "approved");
}

export async function rejectPersistentCandidate(supabase: SupabaseClient, id: string, reason: string) {
  const rejectionReason = z.string().trim().min(3).max(500).parse(reason);
  return updateCandidateReview(supabase, id, { status: "rejected", review_status: "rejected", rejection_reason: rejectionReason }, "rejected", rejectionReason);
}

export async function updatePersistentCandidateSuggestedPrice(supabase: SupabaseClient, id: string, rawPrice: unknown) {
  const candidate = await getPersistentCandidate(supabase, id);
  const suggestedPrice = z.coerce.number().positive().max(100000).parse(rawPrice);
  const landedCost = Number(candidate.supplier_cost) + Number(candidate.estimated_shipping_cost);
  const marginPercent = suggestedPrice <= 0 ? 0 : Math.round(((suggestedPrice - landedCost) / suggestedPrice) * 10000) / 100;
  const { data, error } = await supabase.from("autopilot_product_candidates").update({
    suggested_price: suggestedPrice,
    margin_percent: marginPercent,
    pricing: { ...(isRecord(candidate.pricing) ? candidate.pricing : {}), suggestedSalePrice: suggestedPrice, estimatedMarginPercent: marginPercent, priceEditedByAdmin: true },
    updated_at: new Date().toISOString(),
  }).eq("id", candidate.id).select("*").single();
  if (error) throw new Error(error.message);
  await logReviewEvent(supabase, {
    candidateId: candidate.id,
    eventType: "note_added",
    previousStatus: candidate.review_status,
    newStatus: candidate.review_status,
    metadata: { field: "suggested_price", previousValue: candidate.suggested_price, newValue: suggestedPrice, marginPercent },
  });
  await logAutopilotEvent(supabase, { candidateId: candidate.id, level: "info", message: "Suggested price edited by admin. Candidate remains review-only." });
  return data;
}

export async function markPersistentCandidateNeedsReview(supabase: SupabaseClient, id: string) {
  return updateCandidateReview(supabase, id, { status: "pending_admin_review", review_status: "pending_admin_review" }, "needs_review");
}

export async function addPersistentCandidateAdminNote(supabase: SupabaseClient, id: string, reason: string, actorId?: string) {
  const candidate = await getPersistentCandidate(supabase, id);
  const note = z.string().trim().min(3).max(1000).parse(reason);
  await logReviewEvent(supabase, {
    candidateId: candidate.id,
    actorId,
    eventType: "note_added",
    previousStatus: candidate.review_status,
    newStatus: candidate.review_status,
    reason: note,
    metadata: { note },
  });
  await logAutopilotEvent(supabase, { candidateId: candidate.id, level: "info", message: "Admin note added to candidate audit history." });
  return candidate;
}

export async function createPersistentManualCandidate(supabase: SupabaseClient, rawInput: unknown) {
  const result = runProductDiscovery({ connectorId: "manual", ...(isRecord(rawInput) ? rawInput : {}) });
  if (result.status !== "completed" || result.candidates.length === 0) {
    throw new Error(result.message || "Manual candidate could not be normalized");
  }
  const candidate = result.candidates[0] as ProductCandidate;
  const row = createAutopilotCandidateRow("", candidate);
  delete (row as { discovery_run_id?: string }).discovery_run_id;
  const { data, error } = await supabase.from("autopilot_product_candidates").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  await logReviewEvent(supabase, { candidateId: data.id, eventType: "discovered", newStatus: "pending_admin_review", metadata: { provider: "manual" } });
  return data;
}

export async function generatePersistentAiDraft(supabase: SupabaseClient, id: string) {
  const candidate = await getPersistentCandidate(supabase, id);
  const draft = generateCommercialDraft(mapPersistentCandidateRowToCandidate(candidate));
  const { data, error } = await supabase.from("autopilot_ai_product_drafts").insert({
    product_candidate_id: candidate.id,
    generated_title: draft.title,
    generated_subtitle: draft.subtitle,
    generated_description: draft.emailBody,
    benefits: draft.benefits,
    instagram_caption: draft.socialCaption,
    whatsapp_text: draft.whatsappText,
    email_subject: draft.emailSubject,
    email_body: draft.emailBody,
    warnings: [draft.safetyNotice],
    status: "draft_review_only",
  }).select("*").single();
  if (error) throw new Error(error.message);
  await logAutopilotEvent(supabase, { candidateId: candidate.id, level: "info", message: "Review-only commercial draft generated. No outbound send enabled." });
  return data;
}

export async function importPersistentCandidateToDraft(supabase: SupabaseClient, id: string, userId: string) {
  const candidate = await getPersistentCandidate(supabase, id);
  if (candidate.review_status !== "approved_for_draft") throw new Error("Candidate must be approved_for_draft before import");
  const slug = `${normalizeSlug(candidate.title)}-${candidate.id.slice(0, 8)}`;
  const riskLevel = candidate.risk_flags?.length ? "blocked" : "medium";
  const draftRow = createDraftProductRow(candidate, userId);
  const { data: product, error } = await supabase.from("marketplace_products").insert({
    ...draftRow,
    slug,
    short_description: (candidate.description ?? candidate.title).slice(0, 150),
    category: candidate.category ?? "Sin categoria",
    target_margin_percent: candidate.margin_percent,
    target_margin_amount: candidate.suggested_price - candidate.supplier_cost - candidate.estimated_shipping_cost,
    risk_level: riskLevel,
  }).select("id, publication_status").single();
  if (error || !product) throw new Error(error?.message ?? "Could not import draft product");
  await supabase.from("autopilot_product_candidates").update({ status: "imported_to_draft", review_status: "imported_to_products", imported_product_id: product.id, updated_at: new Date().toISOString() }).eq("id", candidate.id);
  await logReviewEvent(supabase, { candidateId: candidate.id, eventType: "imported_draft", previousStatus: candidate.review_status, newStatus: "imported_to_products", actorId: userId });
  await logAutopilotEvent(supabase, { candidateId: candidate.id, level: "info", message: "Candidate imported as draft product. Automatic publication remains disabled." });
  return product;
}

export async function listPersistentLogs(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("autopilot_logs").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function updateCandidateReview(supabase: SupabaseClient, id: string, patch: Record<string, unknown>, eventType: "approved" | "rejected" | "needs_review", reason?: string) {
  const candidateId = z.string().uuid().parse(id);
  const previous = await getPersistentCandidate(supabase, candidateId);
  const { data, error } = await supabase.from("autopilot_product_candidates").update({ ...patch, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", candidateId).select("*").single();
  if (error) throw new Error(error.message);
  await logAutopilotEvent(supabase, { candidateId, level: "info", message: `Candidate review status changed to ${String(patch.review_status)}.` });
  await logReviewEvent(supabase, { candidateId, eventType, previousStatus: previous.review_status, newStatus: String(patch.review_status), reason });
  return data;
}

async function logReviewEvent(supabase: SupabaseClient, input: { candidateId: string; eventType: string; previousStatus?: string; newStatus?: string; reason?: string; actorId?: string; metadata?: Record<string, unknown> }) {
  const { error } = await supabase.from("autopilot_review_events").insert({
    candidate_id: input.candidateId, event_type: input.eventType, previous_status: input.previousStatus,
    new_status: input.newStatus, reason: input.reason, actor_id: input.actorId, metadata: input.metadata ?? {},
  });
  if (error) throw new Error(error.message);
}

async function logAutopilotEvent(supabase: SupabaseClient, input: { runId?: string; candidateId?: string; level: "info" | "warning" | "error"; message: string }) {
  const { error } = await supabase.from("autopilot_logs").insert({ run_id: input.runId, candidate_id: input.candidateId, level: input.level, message: input.message });
  if (error) throw new Error(error.message);
}

export function createAutopilotCandidateRow(runId: string, candidate: ProductCandidate) {
  const rawScore = candidate.score as ProductCandidate["score"] & {
    brandFitScore?: number; riskScore?: number; contentQualityScore?: number;
    scoreBreakdown?: Record<string, number>; strengths?: string[]; weaknesses?: string[];
  };
  const rawPayload = {
    ...candidate.rawPayload,
    estimatedDeliveryDays: candidate.estimatedDeliveryDays,
    provenance: candidate.provenance,
    normalized_candidate: {
      connectorId: candidate.connectorId,
      provider: candidate.provider,
      externalId: candidate.externalId,
      sourceUrl: candidate.sourceUrl,
      supplierName: candidate.supplierName,
      supplierCost: candidate.supplierCost,
      shippingCost: candidate.shippingCost,
      inventoryTotal: candidate.inventoryTotal ?? 0,
      verifiedInventory: candidate.verifiedInventory ?? 0,
      rating: candidate.rating ?? null,
      imageRightsStatus: candidate.imageRightsStatus,
      resaleRightsStatus: candidate.resaleRightsStatus,
    },
  };
  return {
    discovery_run_id: runId,
    supplier_name: candidate.supplierName,
    title: candidate.title,
    description: candidate.description,
    category: candidate.category,
    source_url: candidate.sourceUrl,
    raw_payload: rawPayload,
    pricing: { suggestedSalePrice: candidate.suggestedSalePrice, estimatedMarginPercent: candidate.estimatedMarginPercent },
    scoring: candidate.score,
    risk_flags: candidate.riskFlags,
    supplier_cost: candidate.supplierCost,
    estimated_shipping_cost: candidate.shippingCost,
    suggested_price: candidate.suggestedSalePrice,
    margin_percent: candidate.estimatedMarginPercent,
    profitability_score: candidate.score.profitability,
    viral_score: candidate.score.viral,
    compliance_score: candidate.score.compliance,
    logistics_score: candidate.score.logistics,
    supplier_score: candidate.score.supplier,
    total_score: candidate.score.total,
    provider: candidate.provider,
    external_id: candidate.externalId ?? candidate.id,
    image_url: candidate.imageUrl,
    landed_cost: candidate.supplierCost + candidate.shippingCost,
    brand_fit_score: rawScore.brandFitScore ?? 0,
    risk_score: rawScore.riskScore ?? (candidate.riskFlags.length ? 70 : 0),
    content_quality_score: rawScore.contentQualityScore ?? 0,
    score_breakdown: {
      ...(rawScore.scoreBreakdown ?? candidate.score),
      recommendation: rawScore.recommendation ?? "review",
      warnings: rawScore.warnings ?? [],
      blockers: rawScore.blockers ?? [],
      estimatedDeliveryDays: candidate.estimatedDeliveryDays,
    },
    strengths: rawScore.strengths ?? candidate.score.explanation,
    weaknesses: rawScore.weaknesses ?? candidate.riskFlags,
    currency: candidate.currency,
    image_urls: candidate.imageUrl ? [candidate.imageUrl] : [],
    status: candidate.riskFlags.includes("blocked_commercial_risk") ? "archived" : "pending_admin_review",
    review_status: candidate.riskFlags.includes("blocked_commercial_risk") ? "blocked_no_publish" : "pending_admin_review",
  };
}

export function mapPersistentCandidateRowToCandidate(row: Record<string, unknown>): ProductCandidate {
  const rawPayload = isRecord(row.raw_payload) ? row.raw_payload : {};
  const provenance = isRecord(rawPayload.provenance) ? rawPayload.provenance : {};
  const normalizedCandidate = isRecord(rawPayload.normalized_candidate) ? rawPayload.normalized_candidate : {};
  const scoring = isRecord(row.scoring) ? row.scoring : {};
  return {
    id: String(row.id),
    connectorId: String(normalizedCandidate.connectorId ?? row.provider ?? "mock"),
    provider: String(row.provider ?? normalizedCandidate.provider ?? "mock"),
    externalId: stringOrUndefined(row.external_id ?? normalizedCandidate.externalId),
    supplierName: String(row.supplier_name),
    title: String(row.title),
    description: String(row.description ?? ""),
    category: String(row.category ?? "Sin categoria"),
    sourceUrl: String(row.source_url ?? ""),
    imageUrl: Array.isArray(row.image_urls) ? String(row.image_urls[0] ?? "") : undefined,
    supplierCost: Number(row.supplier_cost),
    shippingCost: Number(row.estimated_shipping_cost),
    currency: row.currency === "UYU" ? "UYU" : "USD",
    inventoryTotal: numberOrUndefined(normalizedCandidate.inventoryTotal),
    verifiedInventory: numberOrUndefined(normalizedCandidate.verifiedInventory),
    estimatedDeliveryDays: Number(rawPayload.estimatedDeliveryDays ?? 0),
    suggestedSalePrice: Number(row.suggested_price),
    estimatedMarginPercent: Number(row.margin_percent),
    rating: numberOrUndefined(normalizedCandidate.rating ?? provenance.rating),
    imageRightsStatus: isRightsStatus(normalizedCandidate.imageRightsStatus) ? normalizedCandidate.imageRightsStatus : isRightsStatus(provenance.imageRights) ? provenance.imageRights : "unknown",
    resaleRightsStatus: isRightsStatus(normalizedCandidate.resaleRightsStatus) ? normalizedCandidate.resaleRightsStatus : isRightsStatus(provenance.resaleRights) ? provenance.resaleRights : "unknown",
    rawPayload,
    provenance: {
      rawPayload: isRecord(provenance.rawPayload) ? provenance.rawPayload : rawPayload,
      sourceUrl: stringOrUndefined(provenance.sourceUrl ?? row.source_url),
      externalId: stringOrUndefined(provenance.externalId ?? row.external_id),
      provider: String(provenance.provider ?? row.provider ?? "mock"),
      supplier: String(provenance.supplier ?? row.supplier_name ?? "Proveedor no especificado"),
      price: numberOrZero(provenance.price ?? row.supplier_cost),
      shipping: numberOrZero(provenance.shipping ?? row.estimated_shipping_cost),
      stock: numberOrZero(provenance.stock ?? normalizedCandidate.verifiedInventory ?? normalizedCandidate.inventoryTotal),
      rating: numberOrUndefined(provenance.rating),
      imageRights: isRightsStatus(provenance.imageRights) ? provenance.imageRights : "unknown",
      resaleRights: isRightsStatus(provenance.resaleRights) ? provenance.resaleRights : "unknown",
    },
    score: {
      profitability: Number(scoring.profitability ?? row.profitability_score ?? 0),
      viral: Number(scoring.viral ?? row.viral_score ?? 0),
      compliance: Number(scoring.compliance ?? row.compliance_score ?? 0),
      logistics: Number(scoring.logistics ?? row.logistics_score ?? 0),
      supplier: Number(scoring.supplier ?? row.supplier_score ?? 0),
      total: Number(scoring.total ?? row.total_score ?? 0),
      explanation: Array.isArray(scoring.explanation) ? scoring.explanation.map(String) : [],
      supplierReliability: Number(scoring.supplierReliability ?? scoring.supplier ?? row.supplier_score ?? 0),
      complianceRisk: Number(scoring.complianceRisk ?? row.risk_score ?? 0),
      shipping: Number(scoring.shipping ?? scoring.logistics ?? row.logistics_score ?? 0),
      marketFit: Number(scoring.marketFit ?? row.brand_fit_score ?? 0),
      recommendation: isRecommendation(scoring.recommendation) ? scoring.recommendation : "review",
    },
    riskFlags: Array.isArray(row.risk_flags) ? row.risk_flags.map(String) : [],
    status: row.status as ProductCandidate["status"],
  };
}

function isRecommendation(value: unknown): value is "reject" | "review" | "approve_candidate" {
  return value === "reject" || value === "review" || value === "approve_candidate";
}

function isRightsStatus(value: unknown): value is "unknown" | "allowed" | "restricted" {
  return value === "unknown" || value === "allowed" || value === "restricted";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberOrUndefined(value: unknown): number | undefined {
  const number = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
  return Number.isFinite(number) ? number : undefined;
}

function numberOrZero(value: unknown): number {
  return numberOrUndefined(value) ?? 0;
}
