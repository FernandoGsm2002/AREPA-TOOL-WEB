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
    </div>
  );
}
