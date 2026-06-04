import { parseCsv } from "@/services/import-service";
import { normalizeManualProduct } from "../core/normalize";
import type { DiscoveryInput, DiscoveryPayloadFormat, NormalizedSupplierProduct } from "../core/types";

export function parseCsvJsonDiscoveryInput(input: DiscoveryInput): NormalizedSupplierProduct[] {
  const payloadText = input.payloadText?.trim();
  if (!payloadText) {
    throw new Error("CSV/JSON discovery requires payloadText");
  }

  const rows = input.payloadFormat === "csv"
    ? parseCsv(payloadText)
    : parseJsonRows(payloadText);

  return rows.map((row, index) => normalizeManualProduct({
    provider: "csv-json",
    providerProductId: getFirstString(row, ["external_id", "externalId", "providerProductId", "id", "sku"]) ?? `csv-json-${index + 1}`,
    supplierName: getFirstString(row, ["supplier", "supplier_name", "supplierName", "vendor", "provider_name"]) ?? "Importacion CSV/JSON Victoriosa",
    sourceUrl: getFirstString(row, ["source_url", "sourceUrl", "url"]),
    title: getFirstString(row, ["title", "name"]) ?? `Producto importado ${index + 1}`,
    description: getFirstString(row, ["description", "summary", "body"]) ?? "Fila importada para revision humana obligatoria.",
    imageUrl: getFirstString(row, ["image_url", "imageUrl", "mainImageUrl", "image"]),
    category: getFirstString(row, ["category", "niche"]) ?? input.category ?? "Beauty",
    buyPrice: getFirstNumber(row, ["price", "buyPrice", "supplierCost", "supplier_cost", "cost"]) ?? 0,
    shippingCost: getFirstNumber(row, ["shipping", "shippingCost", "shipping_cost"]) ?? 0,
    inventoryTotal: getFirstInteger(row, ["stock", "inventory", "inventoryTotal", "inventory_total"]) ?? 0,
    verifiedInventory: getFirstInteger(row, ["verifiedInventory", "verified_inventory", "stockVerified"]) ?? getFirstInteger(row, ["stock", "inventory", "inventoryTotal", "inventory_total"]) ?? 0,
    rating: getFirstNumber(row, ["rating", "supplierRating", "reviews_rating"]),
    imageRightsStatus: getRightsStatus(getFirstString(row, ["image_rights", "imageRightsStatus", "imageRights"])),
    resaleRightsStatus: getRightsStatus(getFirstString(row, ["resale_rights", "resaleRightsStatus", "resaleRights"])),
    rawPayload: row,
  }));
}

function parseJsonRows(payloadText: string): Record<string, unknown>[] {
  const parsed = JSON.parse(payloadText) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("JSON discovery payload must be an array");
  }
  return parsed.map((row, index) => {
    if (!isRecord(row)) {
      throw new Error(`JSON discovery row ${index + 1} must be an object`);
    }
    return row;
  });
}

function getFirstString(row: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function getFirstNumber(row: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function getFirstInteger(row: Record<string, unknown>, keys: string[]): number | undefined {
  const value = getFirstNumber(row, keys);
  return value === undefined ? undefined : Math.max(0, Math.trunc(value));
}

function getRightsStatus(value: string | undefined): DiscoveryInput["imageRightsStatus"] {
  if (value === "allowed" || value === "restricted") return value;
  return "unknown";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
