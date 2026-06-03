import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { EMPTY_CATALOG_MESSAGE } from "@/domain/public-catalog";
import { getSofiaHeroAsset } from "@/lib/brand/sofia-hero";
import { getPublicCatalog } from "@/services/public-catalog-service";

export const dynamic = "force-dynamic";

const heroTags = [
  "Rituales faciales",
  "Rituales corporales",
  "Asesoría personalizada",
  "Belleza limpia",
];

export default async function HomePage() {
  const featured = (await getPublicCatalog()).slice(0, 8);
  const heroAsset = getSofiaHeroAsset();
  const rituals = [
    ["Rostro en calma", "Cuidado facial", "Texturas suaves, limpieza y luminosidad cotidiana."],
    ["Cuerpo consciente", "Cuidado corporal", "Rituales simples para volver al cuerpo con presencia."],
    ["Belleza preparada", "Accesorios", "Organizadores y herramientas para una rutina serena."],
  ];

  return (
    <main className="premium-home">
      <section className="reference-hero-wrap">
        <div className="reference-hero-shell">
          <div className="reference-hero-image-shell">
            <Image
              alt={heroAsset.alt}
              className="reference-hero-image reference-hero-image-desktop"
              height={1024}
              priority
              sizes="(max-width: 920px) 100vw, 88vw"
              src={heroAsset.desktopSrc}
              width={1792}
            />
            <Image
              alt={heroAsset.alt}
              className="reference-hero-image reference-hero-image-mobile"
              height={1024}
              priority
              sizes="100vw"
              src={heroAsset.mobileSrc}
              width={1792}
            />
            <div className="reference-hero-overlay" />
            <div className="reference-hero-copy">
              <p className="hero-overline">Rituales de Belleza Consciente</p>
              <h1>Tu belleza, en calma.</h1>
              <p className="hero-support">
                Una selección curada para rostro, cuerpo y bienestar, con asesoría cercana y una experiencia cálida, refinada y confiable.
              </p>
              <p className="hero-authority">Inspirada por Sofía Victoria, fundadora de Victoriosa.</p>
              <div className="hero-actions">
                <Link className="editorial-button" href="/productos">Descubrir rituales</Link>
                <Link className="editorial-button editorial-button-ghost" href="/evaluacion-online">Agendar evaluación</Link>
              </div>
              <div className="hero-tag-row" aria-label="Etiquetas curadas">
                {heroTags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
            <div className="hero-image-caption">{heroAsset.caption}</div>
          </div>
        </div>
      </section>

      <section className="trust-band" aria-label="Confianza Victoriosa">
        <article><span>01</span><strong>Selección curada</strong><p>Productos elegidos por coherencia, utilidad y belleza cotidiana.</p></article>
        <article><span>02</span><strong>Asesoría personalizada</strong><p>Orientación cercana para elegir sin ruido ni presión.</p></article>
        <article><span>03</span><strong>Experiencia profesional</strong><p>Una mirada estética responsable, cálida y humana.</p></article>
      </section>

      <section className="container-page editorial-section">
        <div className="section-heading">
          <p className="eyebrow">SELECCIÓN VICTORIOSA</p>
          <h2>Esenciales para rituales suaves</h2>
          <p>Destacados para construir una rutina simple, sensorial y confiable. La disponibilidad se confirma antes de cualquier compra.</p>
        </div>
        {featured.length > 0 ? <div className="grid-products">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <section className="card"><p>{EMPTY_CATALOG_MESSAGE}</p></section>}
      </section>

      <section className="rituals-section">
        <div className="section-heading">
          <p className="eyebrow">RITUALES</p>
          <h2>Elegir desde la calma</h2>
        </div>
        <div className="ritual-grid">
          {rituals.map(([title, category, description]) => (
            <Link className="ritual-card" href={`/productos?categoria=${encodeURIComponent(category)}`} key={title}>
              <span>{category}</span>
              <strong>{title}</strong>
              <p>{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="guidance-section">
        <div>
          <p className="eyebrow">ACOMPAÑAMIENTO</p>
          <h2>Una evaluación cercana para elegir mejor.</h2>
          <p>Si no sabes por dónde empezar, Victoriosa puede orientarte con una mirada simple, cálida y profesional. Sin promesas médicas ni presión comercial.</p>
        </div>
        <Link className="editorial-button editorial-button-light" href="/evaluacion-online">Agendar evaluación</Link>
      </section>

      <section className="editorial-manifesto">
        <p className="eyebrow">VICTORIOSA</p>
        <h2>Belleza que se siente propia.</h2>
        <p>Estética, cuidado personal y orientación responsable para elegir con confianza, en un entorno sereno y honesto.</p>
      </section>

      <footer className="site-footer">
        <div>
          <p className="eyebrow">VICTORIOSA</p>
          <strong>Estética profesional y bienestar femenino.</strong>
        </div>
        <nav aria-label="Links de pie de página">
          <Link href="/productos">Productos</Link>
          <Link href="/kits">Kits</Link>
          <Link href="/evaluacion-online">Evaluación</Link>
          <Link href="/auth/login">Cuenta</Link>
        </nav>
      </footer>
    </main>
  );
}
