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
    <div>
      <h2 className="font-display text-2xl font-bold">Mis Operaciones</h2>
      <p className="text-muted-foreground mt-1 text-sm">Historial de lo que hiciste desde la app y el panel web.</p>

      {error && <p className="text-destructive mt-4 text-sm">{error}</p>}

      {!items && !error && (
        <div className="text-muted-foreground mt-8 flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Cargando…
        </div>
      )}

      {items && items.length === 0 && (
        <div className="border-border/60 text-muted-foreground mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center text-sm">
          <History className="size-6" />
          Todavía no tienes operaciones registradas.
        </div>
      )}

      {items && items.length > 0 && (
        <div className="border-border/60 mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border/60 bg-muted/40 border-b text-left">
                <th className="px-3 py-2 font-medium">Task ID</th>
                <th className="px-3 py-2 font-medium">Módulo</th>
                <th className="px-3 py-2 font-medium">Operación</th>
                <th className="px-3 py-2 font-medium">Detalle</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.task_id} className="border-border/40 border-b last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">{item.task_id}</td>
                  <td className="px-3 py-2">{item.module}</td>
                  <td className="px-3 py-2">{item.operation}</td>
                  <td className="text-muted-foreground max-w-64 truncate px-3 py-2 text-xs" title={detailSummary(item.details) ?? undefined}>
                    {detailSummary(item.details) ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {item.success ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="size-4" /> OK
                      </span>
                    ) : (
                      <span className="text-destructive inline-flex items-center gap-1" title={item.error_message ?? undefined}>
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
