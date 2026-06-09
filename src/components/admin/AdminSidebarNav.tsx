"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  ClipboardCheck,
  FileText,
  History,
  LayoutDashboard,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
} from "lucide-react";
import type { AdminNavItem } from "@/lib/autopilot/admin/control-center";
import { AUTOPILOT_MENU_ITEMS, STUDIO_MENU_ITEMS } from "@/lib/autopilot/admin/control-center";

const icons = {
  "layout-dashboard": LayoutDashboard,
  sparkles: Sparkles,
  search: Search,
  "clipboard-check": ClipboardCheck,
  "file-text": FileText,
  history: History,
  "sliders-horizontal": SlidersHorizontal,
  "shield-check": ShieldCheck,
  box: Box,
  "shopping-bag": ShoppingBag,
  truck: Truck,
} as const;

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <NavGroup items={[{
        href: "/admin",
        label: "Studio",
        description: "Resumen privado del panel interno.",
        icon: "sparkles",
      }]} pathname={pathname} title="General" />
      <NavGroup items={AUTOPILOT_MENU_ITEMS} pathname={pathname} title="Autopilot" />
      <NavGroup items={STUDIO_MENU_ITEMS} pathname={pathname} title="Marketplace" />
    </div>
  );
}

function NavGroup({ items, pathname, title }: { items: AdminNavItem[]; pathname: string; title: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[#e2bcae]">{title}</p>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = icons[item.icon];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              className={[
                "block rounded-2xl border px-3 py-3 transition",
                active
                  ? "border-[#d99b89] bg-white/10 text-white"
                  : "border-transparent text-[#f8eeee] hover:border-white/10 hover:bg-white/5",
              ].join(" ")}
              href={item.href}
              key={item.href}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[#ddc8bf]">{item.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
