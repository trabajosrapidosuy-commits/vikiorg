import type { NormalizedSupplierProduct } from "./types";

export const victoriosaPriorityCategories = [
  "belleza",
  "estetica",
  "cuidado facial",
  "cuidado corporal",
  "accesorios de belleza",
  "bienestar no medico",
  "hogar",
  "lifestyle femenino",
  "regalos",
  "tendencia",
] as const;

const excludedTerms = [
  "medicamento",
  "suplemento",
  "clinico",
  "arma",
  "adulto",
  "quimico peligroso",
  "replica",
  "falsificacion",
  "cura",
  "milagro",
];

export interface AutopilotBusinessRules {
  minimumMarginPercent: number;
  minimumSuggestedPrice: number;
  maximumSuggestedPrice: number;
  slowShippingDays: number;
  weakSupplierInventory: number;
  minimumTotalScoreForApproval: number;
}

export const defaultAutopilotBusinessRules: AutopilotBusinessRules = {
  minimumMarginPercent: 35,
  minimumSuggestedPrice: 6,
  maximumSuggestedPrice: 180,
  slowShippingDays: 30,
  weakSupplierInventory: 10,
  minimumTotalScoreForApproval: 70,
};

export function evaluateBusinessRules(product: NormalizedSupplierProduct, rules: AutopilotBusinessRules = defaultAutopilotBusinessRules) {
  const text = `${product.title} ${product.description} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
  const warnings: string[] = [];
  const blockers: string[] = [];
  const boosts: string[] = [];

  if (excludedTerms.some((term) => text.includes(term))) {
    blockers.push("Producto excluido por riesgo comercial o regulatorio.");
  }
  if ((product.deliveryEstimateDays ?? 0) > rules.slowShippingDays) {
    warnings.push("Envio lento para validacion comercial inicial.");
  }
  if (product.verifiedInventory < rules.weakSupplierInventory) {
    warnings.push("Proveedor con inventario verificado debil o insuficiente.");
  }
  if (!product.sourceUrl && product.provider !== "manual") {
    warnings.push("Falta URL fuente auditable.");
  }
  if (matchesPriorityCategory(product)) {
    boosts.push("Categoria prioritaria para Victoriosa.");
  }
  if (product.hasVideo || product.tags.some((tag) => tag.toLowerCase().includes("viral"))) {
    boosts.push("Senal visual apta para contenido corto.");
  }

  return { warnings, blockers, boosts, rules };
}

export function matchesPriorityCategory(product: NormalizedSupplierProduct) {
  const category = `${product.category} ${product.niche} ${product.tags.join(" ")}`.toLowerCase();
  return victoriosaPriorityCategories.some((item) => category.includes(item));
}
