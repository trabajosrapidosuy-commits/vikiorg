import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listPersistentDraftImports } from "@/services/autopilot-persistence-service";

export default async function AutopilotDraftsPage() {
  const { supabase } = await requireAdmin();
  const drafts = await listPersistentDraftImports(supabase);

  return (
    <main className="card overflow-x-auto">
      <h2 className="text-xl font-bold">Drafts importados por Autopilot</h2>
      <p className="mt-2 text-sm text-gray-700">
        Cada fila mantiene trazabilidad de origen y permanece en estado draft dentro del catalogo interno.
      </p>
      <table className="mt-4 w-full min-w-[960px] text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Producto</th>
            <th className="p-2">Proveedor</th>
            <th className="p-2">Precio sugerido</th>
            <th className="p-2">Margen</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Producto interno</th>
            <th className="p-2">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((draft) => (
            <tr className="border-b" key={draft.id}>
              <td className="p-2">
                <strong>{draft.title}</strong>
                <div className="mt-1 text-xs text-gray-600">{draft.category ?? "Sin categoria"}</div>
              </td>
              <td className="p-2">{draft.provider ?? draft.supplier_name ?? "-"}</td>
              <td className="p-2">USD {Number(draft.suggested_price ?? 0).toFixed(2)}</td>
              <td className="p-2">{Number(draft.margin_percent ?? 0).toFixed(1)}%</td>
              <td className="p-2"><span className="badge">draft + needs_review</span></td>
              <td className="p-2">{draft.imported_product_id ? String(draft.imported_product_id) : "-"}</td>
              <td className="p-2">
                <Link className="font-bold underline" href={`/admin/autopilot/candidates/${String(draft.id)}`}>
                  Ver candidato
                </Link>
              </td>
            </tr>
          ))}
          {drafts.length === 0 && (
            <tr>
              <td className="p-4 text-gray-600" colSpan={7}>Todavia no hay productos importados como draft.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
