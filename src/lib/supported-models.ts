export type SupportedModel = {
  sku: string;
  name: string;
  android: number[];
};

// Catálogo público generado desde el manifest VAL Protocol. Se publica sólo
// compatibilidad (nunca rutas, hashes ni imágenes LK).
export const supportedModels: SupportedModel[] = [
  { sku: "XT2133", name: "Moto G60s", android: [11, 12] },
  { sku: "XT2139", name: "Moto Edge 20 Lite", android: [11, 12, 13] },
  { sku: "XT2149", name: "Moto G50 5G", android: [11, 12] },
  { sku: "XT2163", name: "Moto G Pure", android: [11, 12] },
  { sku: "XT2167", name: "Moto G41", android: [12] },
  { sku: "XT2173", name: "Moto G31 (Coful)", android: [12] },
  { sku: "XT2173-3", name: "Moto G31 (Cofud)", android: [12] },
  { sku: "XT2211", name: "Moto G Stylus (2022)", android: [12] },
  { sku: "XT2213", name: "Moto G 5G (2022)", android: [12, 13] },
  { sku: "XT2255", name: "Moto G72", android: [12, 13] },
  { sku: "XT2271", name: "Moto G Play (2023)", android: [12, 13] },
  { sku: "XT2303", name: "Moto Edge 40", android: [14, 15] },
  { sku: "XT2307", name: "Moto Edge 40 Neo 5G", android: [13, 14, 15] },
  { sku: "XT2311", name: "Moto G Power 5G (2023)", android: [14] },
  { sku: "XT2317", name: "Moto G Stylus (2023)", android: [14] },
  { sku: "XT2343", name: "Moto G54 5G", android: [11, 13, 14, 15] },
  { sku: "XT2409", name: "Moto Edge 50 Neo 5G", android: [14, 15, 16] },
  { sku: "XT2415", name: "Moto G Power 5G (2024)", android: [15] },
  { sku: "XT2435", name: "Moto G55 5G", android: [14, 15, 16] },
  { sku: "XT2453-1", name: "Moto Razr 50", android: [16] },
  { sku: "XT2453V", name: "Moto Razr 50 (variante V)", android: [16] },
  { sku: "XT2503", name: "Moto Edge 60 Fusion", android: [15, 16] },
  { sku: "XT2505", name: "Moto Edge 60", android: [15, 16] },
  { sku: "XT2507", name: "Moto Edge 60 Pro", android: [15, 16] },
  { sku: "XT2509", name: "Moto Edge 60 Neo", android: [16] },
  { sku: "XT2513", name: "Moto G 5G (2025)", android: [15, 16] },
  { sku: "XT2515", name: "Moto G Power 5G (2025)", android: [16] },
  { sku: "XT2515V", name: "Moto G Power 5G (variante V)", android: [16] },
  { sku: "XT2519", name: "Moto Edge (2025)", android: [15] },
  { sku: "XT2527", name: "Moto G86 / G86 Power 5G", android: [14, 15, 16] },
  { sku: "XT2529", name: "Moto G56 / G66 5G", android: [15, 16] },
  { sku: "XT2553", name: "Moto Razr 60", android: [16] },
  { sku: "XT2607", name: "Moto Edge 70 Pro", android: [16] },
  { sku: "XT2613", name: "Moto G (2026)", android: [16] },
  { sku: "XT2615", name: "Moto G Play (2026)", android: [16] },
  { sku: "XT2617", name: "Moto G Power (2026)", android: [16] },
  { sku: "XT2621", name: "Moto G67 / G77 5G", android: [16] },
  { sku: "XT2625", name: "Moto G37 / G47 5G", android: [16] },
];

export const auxiliaryModels = [
  { sku: "XT2623", name: "Moto G17", codename: "g17" },
  { sku: "XT2535", name: "Motorola Lagos", codename: "lagos" },
  { sku: "XT2523", name: "Motorola Lamulg", codename: "lamulg" },
  { sku: "XT2521", name: "Motorola Lamu", codename: "lamu" },
];

export const androidVersions = Array.from(
  new Set(supportedModels.flatMap((model) => model.android)),
).sort((a, b) => a - b);

export const supportedCombinations = supportedModels
  .flatMap((model) => model.android.map((android) => ({ ...model, android })))
  .sort((a, b) => a.android - b.android || a.name.localeCompare(b.name));
