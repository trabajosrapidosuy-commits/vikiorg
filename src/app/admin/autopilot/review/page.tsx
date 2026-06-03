import { AutopilotCandidateTable } from "@/components/autopilot/AutopilotCandidateTable";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listPersistentCandidates } from "@/services/autopilot-persistence-service";

export default async function AutopilotReviewPage() {
  const { supabase } = await requireAdmin();
  const candidates = (await listPersistentCandidates(supabase))
    .filter((candidate) => candidate.review_status === "pending_admin_review" || candidate.review_status === "blocked_no_publish")
    .sort((left, right) => Number(right.total_score) - Number(left.total_score));

  return (
    <main className="space-y-5">
      <section className="card">
        <h2 className="text-xl font-bold">Revision humana</h2>
        <p className="mt-2 text-sm text-gray-700">
          Cola privada para decidir aprobacion, rechazo o importacion a draft. Ningun producto se publica desde aqui.
        </p>
      </section>
      <section className="card">
        <AutopilotCandidateTable
          candidates={candidates}
          emptyMessage="No hay candidatos pendientes de decision humana."
        />
      </section>
    </main>
  );
}
