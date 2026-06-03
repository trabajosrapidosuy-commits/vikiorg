import { requireAdmin } from "@/lib/supabase/require-admin";
import { listPersistentDiscoveryRuns } from "@/services/autopilot-persistence-service";

export default async function AutopilotRunsPage() {
  const { supabase } = await requireAdmin();
  const runs = await listPersistentDiscoveryRuns(supabase);
  return (
    <main className="card overflow-x-auto">
      <h2 className="text-xl font-bold">Ejecuciones Autopilot</h2>
      <p className="mt-2 text-sm text-gray-700">Historial privado de discovery, simulaciones y resultados review-only.</p>
      <table className="mt-4 w-full min-w-[960px] text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Fecha</th>
            <th className="p-2">Fuente</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Modo</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Resultado</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr className="border-b" key={run.id}>
              <td className="p-2">{new Date(run.created_at).toLocaleString()}</td>
              <td className="p-2">{run.query || run.category || "sin query"}</td>
              <td className="p-2">{Number((run.summary as { candidateCount?: number } | null)?.candidateCount ?? 0)}</td>
              <td className="p-2">{run.status === "needs_credentials" ? "autorizado pendiente" : "mock/review"}</td>
              <td className="p-2"><span className="badge">{run.status}</span></td>
              <td className="p-2">{run.error_message ?? "Sin errores reportados"}</td>
            </tr>
          ))}
          {runs.length === 0 && (
            <tr>
              <td className="p-4 text-gray-600" colSpan={6}>No hay runs registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
