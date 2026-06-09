type AuditEvent = {
  id: string;
  event_type?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  reason?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function AutopilotAuditTimeline({ events }: { events: AuditEvent[] }) {
  return (
    <div className="card">
      <h3 className="font-bold">Historial y auditoria</h3>
      <ul className="mt-4 space-y-3">
        {events.map((event) => (
          <li className="rounded-2xl border border-[#eadbd3] bg-[#fffaf7] p-4" key={event.id}>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7165]">
              <span>{event.event_type ?? "evento"}</span>
              <span>{formatDate(event.created_at)}</span>
            </div>
            <p className="mt-2 text-sm text-[#3a2a27]">
              {event.previous_status ? `${event.previous_status} -> ` : ""}{event.new_status ?? "sin cambio de estado"}
            </p>
            {event.reason && <p className="mt-2 text-sm text-[#6d5a55]">Motivo: {event.reason}</p>}
            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#f6efe8] p-3 text-xs text-[#5b463d]">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            )}
          </li>
        ))}
        {events.length === 0 && <li className="text-sm text-[#6d5a55]">Sin eventos auditados todavia.</li>}
      </ul>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "sin fecha";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "sin fecha" : date.toLocaleString();
}
