import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, History } from "lucide-react";
import { webApiFetch } from "@/lib/web-session";

interface OperationLog {
  task_id: string;
  module: string;
  operation: string;
  device_model: string | null;
  details: Record<string, unknown> | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

function detailSummary(details: OperationLog["details"]) {
  if (!details || typeof details !== "object") return null;
  const entries = Object.entries(details).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!entries.length) return null;
  return entries.map(([k, v]) => `${k}: ${v}`).join(" · ");
}

export default function MyOperations() {
  const [items, setItems] = useState<OperationLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const data = await webApiFetch("/api/web-operations-list", { limit: 50 });
      if (!data) {
        window.location.href = "/login";
        return;
      }
      if (!data.success) {
        setError(data.error || "No se pudo cargar el historial.");
        return;
      }
      setItems(data.items);
    })();
  }, []);

  return (
    <div className="dashboard-view dashboard-operations">
      <h2 className="dashboard-heading">Mis Operaciones</h2>
      <p className="dashboard-description">Historial de lo que hiciste desde la app y el panel web.</p>

      {error && <p className="dashboard-error text-destructive text-sm" role="alert">{error}</p>}

      {!items && !error && (
        <div className="dashboard-state text-muted-foreground flex items-center gap-2 text-sm" role="status">
          <Loader2 className="size-4 animate-spin" />
          Cargando…
        </div>
      )}

      {items && items.length === 0 && (
        <div className="dashboard-empty text-muted-foreground flex flex-col items-center gap-3 text-center text-sm">
          <History className="size-6" />
          Todavía no tienes operaciones registradas.
        </div>
      )}

      {items && items.length > 0 && (
        <div className="dashboard-table-scroll" tabIndex={0} role="region" aria-label="Mis Operaciones">
          <table className="dashboard-operations-table w-full text-sm">
            <thead>
              <tr className="border-border/60 bg-muted/40 border-b text-left">
                <th scope="col">Task ID</th>
                <th scope="col">Módulo</th>
                <th scope="col">Operación</th>
                <th scope="col">Detalle</th>
                <th scope="col">Estado</th>
                <th scope="col">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.task_id} className="border-border/40 border-b last:border-0">
                  <td className="dashboard-task-id font-mono text-xs">{item.task_id}</td>
                  <td className="px-3 py-2">{item.module}</td>
                  <td className="px-3 py-2">{item.operation}</td>
                  <td className="dashboard-operation-detail text-muted-foreground text-xs" title={detailSummary(item.details) ?? undefined}>
                    {detailSummary(item.details) ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {item.success ? (
                      <span className="dashboard-operation-status inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="size-4" /> OK
                      </span>
                    ) : (
                      <span className="dashboard-operation-status text-destructive inline-flex items-center gap-1" title={item.error_message ?? undefined}>
                        <XCircle className="size-4" /> Error
                      </span>
                    )}
                  </td>
                  <td className="text-muted-foreground px-3 py-2 text-xs whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
