import { useEffect, useState } from "react";
import { Loader2, BadgeCheck, CalendarClock, Mail, User } from "lucide-react";
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
    })();
  }, []);

  if (!user) {
    return (
      <div className="dashboard-state text-muted-foreground flex items-center gap-2 text-sm" role="status">
        <Loader2 className="size-4 animate-spin" />
        Cargando…
      </div>
    );
  }

  const expiresText = user.subscriptionEnd
    ? new Date(user.subscriptionEnd).toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" })
    : "Sin fecha de vencimiento";

  return (
    <div className="dashboard-view dashboard-account">
      <h2 className="dashboard-heading">Cuenta y Licencia</h2>
      <p className="dashboard-description">Estado de tu cuenta ArepaTool.</p>

      <div className="dashboard-account-details">
        <div className="dashboard-account-identity">
          <User className="dashboard-account-avatar" aria-hidden="true" />
          <span>{user.username}</span>
        </div>
        <div className="dashboard-account-row">
          <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <span>{user.email}</span>
        </div>
        <div className="dashboard-account-row">
          <BadgeCheck className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <Badge variant={user.status === "suspended" ? "destructive" : "default"}>
            {statusLabel[user.status] ?? user.status}
          </Badge>
        </div>
        <div className="dashboard-account-row">
          <CalendarClock className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <span>Vence: {expiresText}</span>
        </div>
        {user.dhruOrderId && (
          <p className="dashboard-account-order text-muted-foreground font-mono text-xs">
            Orden: {user.dhruOrderId}
          </p>
        )}
      </div>
    </div>
  );
}
