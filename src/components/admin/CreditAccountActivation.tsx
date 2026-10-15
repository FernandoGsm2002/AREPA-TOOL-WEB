import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { webApiFetch } from "@/lib/web-session";

type PendingAccount = {
  id: string;
  username: string;
  email: string;
  status: string;
  license_type: string;
  credits: number | string;
  subscription_end: string | null;
};

export default function CreditAccountActivation() {
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setBusy(true); setMessage("");
    try {
      const query = search.trim();
      const result = await webApiFetch("/api/admin/users/list", {
        search: query, status: query ? "" : "pending", limit: 30, offset: 0,
      });
      if (!result?.success) throw new Error(result?.error || "No se pudieron cargar las cuentas.");
      const users = result.users as PendingAccount[];
      setAccounts(query ? users : users.filter(account =>
        account.license_type === "standard" && !account.subscription_end));
      if (query && users.length === 0) setMessage("No se encontró un usuario con ese nombre o correo.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudieron cargar las cuentas.");
    } finally { setBusy(false); }
  };

  const addCredits = async (account: PendingAccount) => {
    const amount = Number(amounts[account.id] || "");
    if (!Number.isInteger(amount) || amount < 1 || amount > 100000) {
      setMessage("Indica un número entero de créditos mayor que cero."); return;
    }
    setBusy(true); setMessage("");
    try {
      const result = await webApiFetch("/api/admin/users/credits", {
        userId: account.id, amount, description: "Recarga administrativa de créditos",
      });
      if (!result?.success) throw new Error(result?.error || "No se pudo asignar saldo.");
      setAccounts(current => current.map(item => item.id === account.id
        ? { ...item, credits: result.credits as number } : item));
      setMessage(`Saldo de ${account.username} actualizado.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo asignar saldo.");
    } finally { setBusy(false); }
  };

  return <div className="border-border/70 bg-card rounded-xl border p-5">
    <h3 className="font-semibold">Cuentas por saldo</h3>
    <p className="text-muted-foreground mt-1 text-sm">Busca cualquier usuario para recargar sus créditos. Sin búsqueda se muestran cuentas nuevas pendientes.</p>
    <form className="mt-4 flex gap-2" onSubmit={event => { event.preventDefault(); void load(); }}>
      <Input value={search} onChange={event => setSearch(event.target.value)}
        placeholder="Buscar usuario o correo" />
      <Button disabled={busy}>Buscar</Button>
    </form>
    {message && <p className="text-muted-foreground mt-3 text-sm">{message}</p>}
    <div className="mt-4 space-y-3">
      {accounts.map(account => <div key={account.id}
        className="border-border/60 flex flex-wrap items-center gap-3 rounded-lg border p-3">
        <div className="min-w-44 flex-1"><p className="font-medium">{account.username}</p>
          <p className="text-muted-foreground text-xs">{account.email} · {account.status} · {account.credits} créditos</p></div>
        <Input type="number" min="1" step="1" value={amounts[account.id] ?? ""}
          onChange={event => setAmounts(current => ({ ...current, [account.id]: event.target.value }))}
          placeholder="Créditos" className="w-28" />
        <Button type="button" variant="outline" disabled={busy}
          onClick={() => void addCredits(account)}>Recargar créditos</Button>
      </div>)}
      {accounts.length === 0 && !message && <p className="text-muted-foreground text-sm">Busca un usuario o consulta las cuentas pendientes.</p>}
    </div>
  </div>;
}
