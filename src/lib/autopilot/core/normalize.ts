import { z } from "zod";
import type { AssetRightsStatus, NormalizedSupplierProduct } from "./types";

const manualProductSchema = z.object({
  provider: z.string().trim().min(1).default("manual"),
  providerProductId: emptyToUndefined(z.string().trim().optional()),
  supplierName: emptyToUndefined(z.string().trim().min(2).max(160).optional()),
  sourceUrl: emptyToUndefined(z.string().url().optional()),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(3).max(5000),
  imageUrl: emptyToUndefined(z.string().url().optional()),
  category: z.string().trim().min(2).max(100),
  buyPrice: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0).default(0),
  inventoryTotal: z.coerce.number().int().min(0).default(0),
  verifiedInventory: z.coerce.number().int().min(0).default(0),
  rating: emptyToUndefined(z.coerce.number().min(0).max(5).optional()),
  imageRightsStatus: z.enum(["unknown", "allowed", "restricted"]).default("unknown"),
  resaleRightsStatus: z.enum(["unknown", "allowed", "restricted"]).default("unknown"),
  rawPayload: z.record(z.string(), z.unknown()).optional(),
});

function emptyToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => value === "" ? undefined : value, schema);
}

export function normalizeManualProduct(input: unknown): NormalizedSupplierProduct {
  const value = manualProductSchema.parse(input);
  return {
    provider: value.provider, providerProductId: value.providerProductId, supplierName: value.supplierName, sourceUrl: value.sourceUrl,
    title: value.title, description: value.description, images: value.imageUrl ? [value.imageUrl] : [],
    category: value.category, niche: "beauty", targetCountry: "UY", currency: "USD",
    buyPrice: value.buyPrice, shippingCost: value.shippingCost, inventoryTotal: value.inventoryTotal,
    verifiedInventory: value.verifiedInventory, rating: value.rating,
    imageRightsStatus: normalizeRightsStatus(value.imageRightsStatus),
    resaleRightsStatus: normalizeRightsStatus(value.resaleRightsStatus),
    tags: [], raw: value.rawPayload ?? {},
  };
}

function normalizeRightsStatus(value: AssetRightsStatus): AssetRightsStatus {
  return value;
}
