import type { NormalizedSupplierProduct } from "../core/types";

export function listMockSupplierProducts(): NormalizedSupplierProduct[] {
  return [
    mock("mock-facial-roller", "Rodillo facial de acero frio", "Accesorio beauty visual para una rutina de autocuidado facial.", "Cuidado facial", 6.5, 2.5, 120, true),
    mock("mock-makeup-organizer", "Organizador de maquillaje giratorio", "Organizador beauty demostrable en video corto con varios compartimentos.", "Organizacion beauty", 11, 4, 80, true),
    mock("mock-exfoliating-brush", "Cepillo exfoliante corporal manual", "Herramienta no invasiva para autocuidado corporal.", "Cuidado corporal", 5, 2, 55, true),
    mock("mock-facial-massager", "Masajeador facial manual", "Accesorio facial no medico para contenido demostrable.", "Cuidado facial", 8, 3, 60, true),
    mock("mock-beauty-sponges", "Set de esponjas beauty", "Set visual de maquillaje para aplicacion cosmetica.", "Maquillaje", 4, 1.5, 150, true),
    mock("mock-risky-cure", "Suplemento milagro que cura enfermedad", "Producto ingerible con promesa medica extrema.", "Salud", 4, 3, 40, false),
  ];
}

function mock(id: string, title: string, description: string, category: string, buyPrice: number, shippingCost: number, inventoryTotal: number, hasVideo: boolean): NormalizedSupplierProduct {
  return {
    provider: "mock", providerProductId: id, supplierName: "Proveedor sandbox Victoriosa", sourceUrl: `https://example.invalid/${id}`,
    title, description, images: [`https://example.invalid/${id}.jpg`], category, niche: "beauty",
    targetCountry: "UY", currency: "USD", buyPrice, shippingCost, inventoryTotal,
    verifiedInventory: inventoryTotal, listedCount: inventoryTotal * 4, rating: hasVideo ? 4.6 : 3.2, reviewsCount: inventoryTotal,
    imageRightsStatus: "allowed", resaleRightsStatus: "unknown",
    hasVideo, freeShipping: shippingCost === 0, deliveryEstimateDays: 18, tags: ["beauty"], raw: { sandbox: true, mockId: id },
  };
}
