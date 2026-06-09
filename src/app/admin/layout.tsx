import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { MarketplaceAccessError, requireAdmin } from "@/lib/supabase/require-admin";

export const metadata: Metadata = {
  title: "Victoriosa Studio",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof MarketplaceAccessError) {
      redirect(error.status === 401 ? "/auth/login" : "/");
    }
    throw error;
  }

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <div>
          <p className="studio-kicker">CONTROL CENTER</p>
          <h1>Victoriosa Studio</h1>
          <p className="studio-caption">Superficie privada de admin/owner para control comercial y revision humana.</p>
        </div>
        <AdminSidebarNav />
        <form action="/auth/logout" method="post">
          <button className="studio-logout" type="submit">Cerrar sesion</button>
        </form>
      </aside>
      <main className="studio-main">{children}</main>
    </div>
  );
}
