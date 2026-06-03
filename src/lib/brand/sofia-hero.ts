import fs from "node:fs";
import path from "node:path";

export type SofiaHeroMode =
  | "approved_brand_asset"
  | "approved_legacy_asset"
  | "placeholder_pending_real_asset";

export interface SofiaHeroAsset {
  alt: string;
  caption: string;
  desktopSrc: string;
  mobileSrc: string;
  mode: SofiaHeroMode;
}

const BRAND_DESKTOP_FILE = "public/brand/sofia-victoria-hero.jpg";
const BRAND_MOBILE_FILE = "public/brand/sofia-victoria-hero-mobile.jpg";
const LEGACY_APPROVED_FILE = "public/victoriosa-hero-editorial.png";
const PLACEHOLDER_FILE = "public/placeholder-product.svg";

function exists(repoRoot: string, relativeFile: string) {
  return fs.existsSync(path.join(repoRoot, relativeFile));
}

function toPublicSrc(relativeFile: string) {
  return `/${relativeFile.replace(/^public[\\/]/, "").replace(/\\/g, "/")}`;
}

export function getSofiaHeroAsset(repoRoot = process.cwd()): SofiaHeroAsset {
  if (exists(repoRoot, BRAND_DESKTOP_FILE)) {
    return {
      alt: "Sofía Victoria, fundadora de Victoriosa, en un ritual de belleza consciente",
      caption: "Sofia Victoria - ritual de belleza consciente",
      desktopSrc: toPublicSrc(BRAND_DESKTOP_FILE),
      mobileSrc: exists(repoRoot, BRAND_MOBILE_FILE)
        ? toPublicSrc(BRAND_MOBILE_FILE)
        : toPublicSrc(BRAND_DESKTOP_FILE),
      mode: "approved_brand_asset",
    };
  }

  if (exists(repoRoot, LEGACY_APPROVED_FILE)) {
    return {
      alt: "Sofía Victoria, fundadora de Victoriosa, en un ritual de belleza consciente",
      caption: "Sofia Victoria - retrato editorial aprobado de la marca",
      desktopSrc: toPublicSrc(LEGACY_APPROVED_FILE),
      mobileSrc: toPublicSrc(LEGACY_APPROVED_FILE),
      mode: "approved_legacy_asset",
    };
  }

  return {
    alt: "Ritual de belleza consciente Victoriosa en una escena editorial wellness",
    caption: "Placeholder temporal. Subir foto aprobada de Sofia Victoria a public/brand.",
    desktopSrc: toPublicSrc(PLACEHOLDER_FILE),
    mobileSrc: toPublicSrc(PLACEHOLDER_FILE),
    mode: "placeholder_pending_real_asset",
  };
}
