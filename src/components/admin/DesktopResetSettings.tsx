import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { webApiFetch } from "@/lib/web-session";

export default function DesktopResetSettings() {
  const [cost, setCost] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    void webApiFetch("/api/admin/desktop-reset/settings").then(result => {
      if (!active) return;
      if (!result?.success) throw new Error(result?.error || "No se pudo consultar el precio.");
      setCost(String(result.creditCost)); setLoaded(true);
    }).catch(error => { if (active) setMessage(error instanceof Error ? error.message : "No se pudo consultar el precio."); });
    return () => { active = false; };
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(cost);
    if (!/^\d+(?:\.\d{1,2})?$/.test(cost.trim()) || value <= 0 || value > 10000) {
      setMessage("Usa un costo mayor que cero, con hasta dos decimales y máximo 10000 créditos."); return;
    }
    setBusy(true); setMessage("");
    try {
      const result = await webApiFetch("/api/admin/desktop-reset/settings/save", { creditCost: value });
      if (!result?.success) throw new Error(result?.error || "No se pudo guardar el precio.");
      setCost(String(result.creditCost));
      setMessage(`Guardado: cada cambio de PC costará ${result.creditCost} créditos.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo guardar el precio."); }
    finally { setBusy(false); }
  };

  return <section className="border-border/70 bg-card rounded-xl border p-5">
    <h2 className="font-semibold">Costo por cambio de PC</h2>
    <p className="text-muted-foreground mt-1 text-sm">Precio para cerrar la sesión de otra computadora e ingresar en una nueva. El aviso del cliente actualizado y el descuento usan este importe.</p>
    <form onSubmit={save} className="mt-4 flex flex-wrap items-end gap-3">
      <label className="grid gap-1.5 text-sm" htmlFor="desktop-reset-cost">Costo en créditos
        <Input id="desktop-reset-cost" type="number" min="0.01" max="10000" step="0.01" value={cost}
          onChange={event => setCost(event.target.value)} disabled={!loaded || busy} placeholder="Cargando…" className="w-40" />
      </label>
      <Button type="submit" disabled={!loaded || busy}>{busy ? "Guardando…" : "Guardar costo"}</Button>
    </form>
    {message && <p className="mt-3 text-sm" role="status">{message}</p>}
  </section>;
}
