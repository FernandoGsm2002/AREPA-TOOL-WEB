import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { webApiFetch } from "@/lib/web-session";
import CreditAccountActivation from "./CreditAccountActivation";

type Price = {
  operation_code: string;
  label: string;
  credit_cost: number | string | null;
  enabled: boolean;
};
type Charge = {
  request_id: string;
  created_at: string;
  operation_code: string;
  cost: number | string;
  status: string;
  username: string;
  device_serial: string | null;
  error_message: string | null;
  operation_log?: string | null;
};

export default function CreditAccessPrices() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [enabledDrafts, setEnabledDrafts] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [charges, setCharges] = useState<Charge[]>([]);
  const [selected, setSelected] = useState<Charge | null>(null);

  const load = async () => {
    try {
      const result = await webApiFetch("/api/admin/credit-access/prices", {});
      if (!result?.success) throw new Error(result?.error || "No se pudieron cargar las tarifas.");
      const rows = result.prices as Price[];
      setPrices(rows);
      setDrafts(Object.fromEntries(rows.map(row => [row.operation_code, row.credit_cost == null ? "" : String(row.credit_cost)])));
      setEnabledDrafts(Object.fromEntries(rows.map(row => [row.operation_code, row.enabled])));
      const attempts = await webApiFetch("/api/admin/credit-access/charges", {});
      if (attempts?.success) setCharges(attempts.charges as Charge[]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudieron cargar las tarifas.");
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async (row: Price) => {
    const raw = drafts[row.operation_code]?.trim() || "";
    const cost = Number(raw);
    const enabled = enabledDrafts[row.operation_code] ?? false;
    if (raw && (!Number.isFinite(cost) || cost <= 0 || cost > 10000 || !/^\d+(?:\.\d{1,2})?$/.test(raw))) {
      setMessage("Usa un precio mayor que cero, con hasta dos decimales.");
      return;
    }
    if (enabled && !raw) { setMessage("Define el precio antes de activar esta operación."); return; }
    setBusy(row.operation_code); setMessage("");
    try {
      const result = await webApiFetch("/api/admin/credit-access/prices/save", {
        operationCode: row.operation_code,
        creditCost: raw ? cost : null,
        enabled,
      });
      if (!result?.success) throw new Error(result?.error || "No se pudo guardar el precio.");
      setPrices(current => current.map(item => item.operation_code === row.operation_code ? result.price as Price : item));
      setMessage(`Precio de ${row.label} guardado.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el precio.");
    } finally { setBusy(null); }
  };

  const openCharge = async (requestId: string) => {
    try {
      const result = await webApiFetch("/api/admin/credit-access/charges/detail", { requestId });
      if (!result?.success) throw new Error(result?.error || "No se pudo cargar el intento.");
      setSelected(result.charge as Charge);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar el intento.");
    }
  };

  return <section className="max-w-4xl space-y-5">
    <CreditAccountActivation />
    <div className="border-border/70 bg-card rounded-xl border p-5">
      <h2 className="font-display text-lg font-semibold">Tarifas para cuentas por saldo</h2>
      <p className="text-muted-foreground mt-1 text-sm">Define el precio y activa cada operación cuando quieras ofrecerla a cuentas por saldo.</p>
    </div>
    {message && <p className="border-border bg-muted/40 rounded-lg border p-3 text-sm">{message}</p>}
    <div className="border-border/70 bg-card divide-border/60 divide-y rounded-xl border">
      {prices.map(row => <div key={row.operation_code} className="flex flex-wrap items-end justify-between gap-4 p-4">
        <div className="min-w-48 flex-1"><p className="font-medium">{row.label}</p><p className="text-muted-foreground mt-1 font-mono text-xs">{row.operation_code}</p></div>
        <label className="grid gap-1 text-xs font-medium">Créditos sin licencia
          <Input type="number" min="0.01" max="10000" step="0.01" placeholder="Por definir" value={drafts[row.operation_code] ?? ""}
            onChange={event => setDrafts(current => ({ ...current, [row.operation_code]: event.target.value }))} className="w-36" />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox"
          checked={enabledDrafts[row.operation_code] ?? false}
          onChange={event => setEnabledDrafts(current => ({ ...current, [row.operation_code]: event.target.checked }))}/>
          Activa</label>
        <Button variant="outline" disabled={busy !== null} onClick={() => save(row)}>{busy === row.operation_code ? "Guardando…" : "Guardar"}</Button>
      </div>)}
      {prices.length === 0 && <p className="text-muted-foreground p-5 text-sm">No hay tarifas configuradas.</p>}
    </div>
    <div className="border-border/70 bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <div><h3 className="font-semibold">Intentos cobrados</h3>
          <p className="text-muted-foreground text-sm">Últimos 100 intentos. Abre uno para revisar el resultado y el log.</p></div>
        <Button variant="outline" onClick={() => void load()}>Actualizar</Button>
      </div>
      <div className="mt-4 max-h-80 overflow-auto">
        {charges.map(charge => <button key={charge.request_id} type="button"
          onClick={() => void openCharge(charge.request_id)}
          className="border-border/60 hover:bg-muted/50 flex w-full items-center justify-between gap-4 border-b px-2 py-3 text-left text-sm">
          <span><strong>{charge.username}</strong><span className="text-muted-foreground ml-2">{charge.operation_code}</span></span>
          <span className="shrink-0">{charge.cost} créditos · {charge.status}</span>
        </button>)}
        {charges.length === 0 && <p className="text-muted-foreground py-3 text-sm">Aún no hay intentos cobrados.</p>}
      </div>
    </div>
    {selected && <div className="border-border/70 bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Intento {selected.request_id}</h3>
        <Button variant="outline" onClick={() => setSelected(null)}>Cerrar</Button></div>
      <p className="text-muted-foreground mt-2 text-sm">{selected.username} · {selected.operation_code} · {selected.cost} créditos · {selected.status}</p>
      <p className="text-muted-foreground text-sm">{new Date(selected.created_at).toLocaleString()} · Dispositivo: {selected.device_serial || "sin serial"}</p>
      {selected.error_message && <p className="mt-3 text-sm text-red-500">{selected.error_message}</p>}
      <pre className="bg-muted/50 mt-4 max-h-96 overflow-auto rounded-lg p-3 text-xs whitespace-pre-wrap">{selected.operation_log || "El resultado aún no ha llegado del cliente."}</pre>
    </div>}
  </section>;
}
