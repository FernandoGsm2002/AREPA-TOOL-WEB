import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { webApiFetch } from "@/lib/web-session";
import CreditAccountActivation from "./CreditAccountActivation";
import DesktopResetSettings from "./DesktopResetSettings";

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
  const [message, setMessage] = useState("");
  const [charges, setCharges] = useState<Charge[]>([]);
  const [selected, setSelected] = useState<Charge | null>(null);

  const load = async () => {
    try {
      const attempts = await webApiFetch("/api/admin/credit-access/charges", {});
      if (attempts?.success) setCharges(attempts.charges as Charge[]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar el historial.");
    }
  };

  useEffect(() => { void load(); }, []);

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
    <DesktopResetSettings />
    {message && <p className="border-border bg-muted/40 rounded-lg border p-3 text-sm">{message}</p>}
    <div className="border-border/70 bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <div><h3 className="font-semibold">Historial de operaciones por saldo</h3>
          <p className="text-muted-foreground text-sm">Histórico de los últimos 100 intentos anteriores al retiro del ingreso por saldo. Abre uno para consultar su resultado y log.</p></div>
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
