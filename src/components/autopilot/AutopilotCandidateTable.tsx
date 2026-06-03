import Link from "next/link";

type CandidateRow = Record<string, unknown>;

export function AutopilotCandidateTable({
  candidates,
  emptyMessage,
}: {
  candidates: CandidateRow[];
  emptyMessage: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Producto</th>
            <th className="p-2">Proveedor</th>
            <th className="p-2">Score total</th>
            <th className="p-2">Rentabilidad</th>
            <th className="p-2">Viralidad</th>
            <th className="p-2">Riesgo</th>
            <th className="p-2">Envio</th>
            <th className="p-2">Margen</th>
            <th className="p-2">Recomendacion</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Fecha</th>
            <th className="p-2">Accion</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const recommendation = getRecommendation(candidate);
            return (
              <tr className="border-b align-top" key={String(candidate.id)}>
                <td className="p-2">
                  <strong>{String(candidate.title)}</strong>
                  <div className="mt-1 text-xs text-gray-600">{String(candidate.category ?? "Sin categoria")}</div>
                </td>
                <td className="p-2">{String(candidate.provider ?? candidate.supplier_name ?? "-")}</td>
                <td className="p-2"><Badge tone="neutral">{Math.round(Number(candidate.total_score ?? 0))}</Badge></td>
                <td className="p-2">{Math.round(Number(candidate.profitability_score ?? 0))}</td>
                <td className="p-2">{Math.round(Number(candidate.viral_score ?? 0))}</td>
                <td className="p-2"><Badge tone={Number(candidate.risk_score ?? 0) >= 70 ? "danger" : Number(candidate.risk_score ?? 0) >= 40 ? "warning" : "success"}>{Math.round(Number(candidate.risk_score ?? 0))}</Badge></td>
                <td className="p-2">{Math.round(Number(candidate.logistics_score ?? 0))}</td>
                <td className="p-2">{Number(candidate.margin_percent ?? 0).toFixed(1)}%</td>
                <td className="p-2"><Badge tone={recommendation === "approve_candidate" ? "success" : recommendation === "reject" ? "danger" : "warning"}>{recommendation}</Badge></td>
                <td className="p-2"><Badge tone="neutral">{String(candidate.review_status ?? candidate.status ?? "review")}</Badge></td>
                <td className="p-2">{formatDate(candidate.created_at)}</td>
                <td className="p-2">
                  <Link className="font-bold underline" href={`/admin/autopilot/candidates/${String(candidate.id)}`}>
                    Ver detalle
                  </Link>
                </td>
              </tr>
            );
          })}
          {candidates.length === 0 && (
            <tr>
              <td className="p-4 text-gray-600" colSpan={12}>{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "neutral" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "border-[#d9cec2] bg-[#f8f3ee] text-[#5a463d]",
    success: "border-[#b8d3c0] bg-[#eff8f1] text-[#2f6f41]",
    warning: "border-[#e7d0a1] bg-[#fff7e4] text-[#8b5f16]",
    danger: "border-[#e0b8b8] bg-[#fff1f1] text-[#8f2d2d]",
  } as const;
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${tones[tone]}`}>{children}</span>;
}

function getRecommendation(candidate: CandidateRow) {
  const scoring = asRecord(candidate.scoring);
  const breakdown = asRecord(candidate.score_breakdown);
  const value = scoring.recommendation ?? breakdown.recommendation;
  return value === "approve_candidate" || value === "reject" || value === "review"
    ? value
    : Number(candidate.risk_score ?? 0) >= 70
      ? "reject"
      : "review";
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || value.length === 0) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}
