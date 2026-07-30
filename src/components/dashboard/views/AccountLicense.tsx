import { useEffect, useState } from "react";
import { Loader2, BadgeCheck, CalendarClock, Mail, User, MonitorCog, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { webApiFetch, loadSession, type WebUser } from "@/lib/web-session";

const statusLabel: Record<string, string> = {
  active: "Activa",
  admin: "Administrador",
  pending: "Pendiente de aprobación",
  suspended: "Suspendida",
};

export default function AccountLicense() {
  const [user, setUser] = useState<WebUser | null>(loadSession()?.user ?? null);
  const [reset, setReset] = useState<{ available: boolean; nextAvailableAt: string | null } | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetNotice, setResetNotice] = useState("");

  useEffect(() => {
    (async () => {
      const data = await webApiFetch("/api/web-me", {});
      if (!data) {
        window.location.href = "/login";
        return;
      }
      if (data.success) {
        setUser({
          userId: data.userId,
          username: data.username,
          email: data.email,
          status: data.status,
          subscriptionEnd: data.subscriptionEnd,
          dhruOrderId: data.dhruOrderId,
        });
      }
      const resetStatus = await webApiFetch("/api/web-desktop-reset/status", {});
      if (resetStatus?.success) setReset({ available: resetStatus.available, nextAvailableAt: resetStatus.nextAvailableAt });
    })();
  }, []);

  const resetDesktop = async () => {
    if (!confirm("Esto cerrará la sesión de ArepaTool en tu PC actual y liberará el equipo para iniciar en otra PC. Solo podrás usar esta opción una vez cada 24 horas. ¿Continuar?")) return;
    setResetBusy(true); setResetNotice("");
    const data = await webApiFetch("/api/web-desktop-reset", {});
    setResetBusy(false);
    if (!data) { window.location.href = "/login"; return; }
    if (!data.success) {
      setReset({ available: false, nextAvailableAt: data.nextAvailableAt || reset?.nextAvailableAt || null });
      setResetNotice(data.error || "No se pudo reiniciar la sesión.");
      return;
    }
    setReset({ available: false, nextAvailableAt: data.nextAvailableAt });
    setResetNotice("PC liberada. Ya puedes iniciar ArepaTool en tu otra computadora.");
  };

  if (!user) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Cargando…
      </div>
    );
  }

  const expiresText = user.subscriptionEnd
    ? new Date(user.subscriptionEnd).toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" })
    : "Sin fecha de vencimiento";

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-2xl font-bold">Cuenta y Licencia</h2>
      <p className="text-muted-foreground mt-1 text-sm">Estado de tu cuenta ArepaTool.</p>

      <div className="border-border/60 bg-card mt-6 space-y-4 rounded-xl border p-6">
        <div className="flex items-center gap-3">
          <User className="text-muted-foreground size-4" />
          <span className="font-medium">{user.username}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="text-muted-foreground size-4" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <BadgeCheck className="text-muted-foreground size-4" />
          <Badge variant={user.status === "suspended" ? "destructive" : "default"}>
            {statusLabel[user.status] ?? user.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <CalendarClock className="text-muted-foreground size-4" />
          <span>Vence: {expiresText}</span>
        </div>
        {user.dhruOrderId && (
          <p className="text-muted-foreground border-border/60 border-t pt-3 font-mono text-xs">
            Orden: {user.dhruOrderId}
          </p>
        )}
      </div>
      <div className="border-border/60 bg-card mt-5 rounded-xl border p-6">
        <div className="flex gap-3"><span className="bg-primary/12 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"><MonitorCog className="size-[18px]"/></span><div><h3 className="font-semibold">Cambiar de PC</h3><p className="text-muted-foreground mt-1 text-sm">Libera la sesión de escritorio si necesitas usar ArepaTool en otra computadora. Disponible una vez cada 24 horas.</p></div></div>
        {resetNotice && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${resetNotice.startsWith("PC liberada") ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{resetNotice}</p>}
        {reset && !reset.available && reset.nextAvailableAt && <p className="text-muted-foreground mt-4 text-xs">Próximo reinicio disponible: {new Date(reset.nextAvailableAt).toLocaleString("es-PE")}</p>}
        <Button className="mt-4" variant={reset?.available === false ? "outline" : "default"} disabled={resetBusy || reset?.available === false} onClick={resetDesktop}>{resetBusy ? <Loader2 className="animate-spin"/> : <RotateCcw/>}{resetBusy ? "Liberando PC…" : reset?.available === false ? "Reinicio utilizado hoy" : "Liberar mi PC"}</Button>
      </div>
    </div>
  );
}
