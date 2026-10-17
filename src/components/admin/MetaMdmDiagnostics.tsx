import { useEffect, useState } from "react";
import { ArrowDownToLine, ChevronLeft, ChevronRight, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { webApiFetch } from "@/lib/web-session";

type Report = {
  run_id: string;
  client_outcome: string;
  identity: Record<string, string | number>;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  server_stage: string | null;
  profile_id: string | null;
  family_id: string | null;
  has_analysis: boolean;
  has_plan: boolean;
  has_profile_evidence: boolean;
  files?: Record<string, string>;
  source_jar_sha256?: string | null;
  candidate_jar_sha256?: string | null;
};

const pageSize = 30;
const labels: Record<string, string> = {
  applied: "Aplicado según V3",
  analysis_only: "Solo análisis",
  failed: "Falló",
  interrupted: "Interrumpido",
};

function saveFile(runId: string, name: string, content: string) {
  const blob = new Blob([content], { type: name.endsWith(".json") ? "application/json" : "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${runId}_${name}`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function readSummary(content?: string): Record<string, unknown> | null {
  if (!content) return null;
  try {
    const value: unknown = JSON.parse(content);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown> : null;
  } catch { return null; }
}

type CapturedText = { partition?: string; path?: string; sha256?: string;
  lines?: unknown[]; gzip_b64?: string | null };

function saveOriginal(runId: string, item: CapturedText) {
  if (!item.gzip_b64) return;
  const binary = atob(item.gzip_b64);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/gzip" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${runId}_${item.partition || "text"}_${(item.path || "source").split("/").pop()}.gz`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MetaMdmDiagnostics() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (nextPage: number) => {
    setBusy(true);
    setError("");
    try {
      const result = await webApiFetch("/api/admin/meta-mdm/list",
        { limit: pageSize, offset: nextPage * pageSize });
      if (!result?.success) throw new Error(result?.error || "No se pudo cargar el historial.");
      setReports(result.reports || []);
      setTotal(result.total || 0);
      setPage(nextPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el historial.");
    } finally { setBusy(false); }
  };

  const open = async (runId: string) => {
    setBusy(true);
    setError("");
    try {
      const result = await webApiFetch("/api/admin/meta-mdm/detail", { runId });
      if (!result?.success) throw new Error(result?.error || "No se pudo abrir el diagnóstico.");
      setSelected(result.report);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo abrir el diagnóstico.");
    } finally { setBusy(false); }
  };

  useEffect(() => { void load(0); }, []);

  return <section className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-semibold">Diagnósticos MDM META</h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">Cada intento conserva el log y la evidencia disponible. “Aplicado” es el resultado verificado y reportado por V3; la etapa de la VPS se muestra por separado.</p>
      </div>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => void load(page)}><RefreshCw/>Actualizar</Button>
    </div>
    {error && <p role="alert" className="text-destructive rounded-lg border border-destructive/30 p-3 text-sm">{error}</p>}
    <div className="border-border/60 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground text-xs"><tr>
          <th className="p-3">Fecha</th><th className="p-3">Usuario</th><th className="p-3">Dispositivo</th>
          <th className="p-3">Resultado V3</th><th className="p-3">Etapa VPS</th><th className="p-3">Evidencia</th>
        </tr></thead>
        <tbody>{reports.map(report => <tr key={report.run_id} className="border-border/50 border-t">
          <td className="p-3 whitespace-nowrap">{new Date(report.updated_at).toLocaleString("es-PE")}</td>
          <td className="p-3"><b>{report.username}</b><span className="text-muted-foreground block text-xs">{report.email}</span></td>
          <td className="p-3"><b>{report.identity?.model || "Sin lectura"}</b><span className="text-muted-foreground block text-xs">{report.identity?.brand || ""} · Android {report.identity?.android || "—"}</span></td>
          <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${report.client_outcome === "applied" ? "bg-emerald-500/15 text-emerald-600" : report.client_outcome === "failed" ? "bg-destructive/10 text-destructive" : "bg-amber-500/15 text-amber-700"}`}>{labels[report.client_outcome] || report.client_outcome}</span></td>
          <td className="p-3 text-xs">{report.server_stage || "Sin etapa"}</td>
          <td className="p-3"><span className="text-muted-foreground block text-xs">{report.has_plan ? "Candidato preparado" : report.has_analysis ? "Análisis disponible" : "Sin candidato"}{report.has_profile_evidence ? " · Perfil capturado" : ""}</span><Button className="mt-1" variant="outline" size="sm" disabled={busy} onClick={() => void open(report.run_id)}><FileText/>Ver archivos</Button></td>
        </tr>)}{reports.length === 0 && <tr><td colSpan={6} className="text-muted-foreground p-8 text-center">Aún no hay intentos beta reportados.</td></tr>}</tbody>
      </table>
    </div>
    {total > 0 && <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} de {total}</span>
      <div className="flex gap-2"><Button size="sm" variant="outline" disabled={busy || page === 0} onClick={() => void load(page - 1)}><ChevronLeft/>Anterior</Button><Button size="sm" variant="outline" disabled={busy || (page + 1) * pageSize >= total} onClick={() => void load(page + 1)}>Siguiente<ChevronRight/></Button></div>
    </div>}
    {selected && <div className="border-border/60 bg-card rounded-xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="font-semibold">Intento {selected.run_id}</h3><p className="text-muted-foreground mt-1 text-xs">{selected.profile_id || selected.family_id || "Sin perfil"} · {labels[selected.client_outcome] || selected.client_outcome}</p></div>
        <Button size="sm" variant="outline" onClick={() => setSelected(null)}>Cerrar</Button>
      </div>
      {(() => {
        const analysis = readSummary(selected.files?.["server_analysis.json"]);
        const plan = readSummary(selected.files?.["plan-summary.json"]);
        const evidence = readSummary(selected.files?.["profile-evidence.json"]);
        const texts: CapturedText[] = Array.isArray(evidence?.texts) ? evidence.texts : [];
        return <div className="bg-muted/30 mt-4 grid gap-3 rounded-lg p-3 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Perfil</span><p className="font-mono text-xs break-all">{selected.profile_id || String(evidence?.profile_id || "Sin perfil")}</p></div>
          <div><span className="text-muted-foreground">Decisión</span><p>{plan ? "Plan preparado" : String(analysis?.reason || "Análisis pendiente")}</p></div>
          <div><span className="text-muted-foreground">Archivos AntiCrack capturados</span><p>{texts.length}</p></div>
          <div><span className="text-muted-foreground">JAR SHA-256</span><p className="font-mono text-xs break-all">{String(evidence?.jar_sha256 || selected.source_jar_sha256 || "No disponible")}</p></div>
          {texts.length > 0 && <div className="space-y-2 sm:col-span-2">
            {texts.map((item, index) => <div key={`${item.partition}:${item.path}:${index}`} className="border-border/60 flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
              <span className="font-mono text-xs break-all">{item.partition}:{item.path} · {item.lines?.length || 0} líneas relevantes</span>
              {item.gzip_b64 && <Button size="sm" variant="outline" onClick={() => saveOriginal(selected.run_id, item)}><ArrowDownToLine/>Original .gz</Button>}
            </div>)}
          </div>}
        </div>;
      })()}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {Object.entries(selected.files || {}).map(([name, content]) => <div key={name} className="border-border/60 flex items-center justify-between gap-3 rounded-lg border p-3">
          <span className="truncate font-mono text-xs">{name}</span>
          <Button size="sm" variant="outline" onClick={() => saveFile(selected.run_id, name, content)}><ArrowDownToLine/>Descargar</Button>
        </div>)}
      </div>
      {!Object.keys(selected.files || {}).length && <p className="text-muted-foreground mt-4 text-sm">Este intento no contiene archivos.</p>}
    </div>}
  </section>;
}
