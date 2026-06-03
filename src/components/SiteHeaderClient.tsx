"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/useCart";

const nav = [
  ["RITUALES", "/productos"],
  ["ROSTRO", "/productos?categoria=Cuidado facial"],
  ["CUERPO", "/productos?categoria=Cuidado corporal"],
  ["KITS", "/kits"],
  ["ASESORÍA", "/evaluacion-online"],
] as const;

export default function SiteHeaderClient({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items, loaded } = useCart();
  const cartCount = loaded ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <header className="site-header">
      <div className="site-header-shell">
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
          className="header-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <nav aria-label="Navegación principal" className="header-nav header-nav-desktop">
          {nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <Link className="brand-wordmark" href="/">
          VICTORIOSA
          <span>BELLEZA EN CALMA</span>
        </Link>
        <div className="header-actions">
          {isAuthenticated ? <Link href="/account">Ingresar</Link> : <Link href="/auth/login">Ingresar</Link>}
          {isAuthenticated ? (
            <form action="/auth/logout" method="post">
              <button type="submit">Salir</button>
            </form>
          ) : (
            <Link href="/auth/register">Crear cuenta</Link>
          )}
          <Link aria-label="Carrito" className="header-cart-link" href="/carrito">
            <ShoppingBag className="h-4 w-4" />
            <span>Carrito</span>
            <strong>{cartCount}</strong>
          </Link>
        </div>
      </div>
      <div className={`header-mobile-panel${menuOpen ? " is-open" : ""}`}>
        <nav aria-label="Navegación móvil" className="header-nav header-nav-mobile">
          {nav.map(([label, href]) => (
            <Link href={href} key={href} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
