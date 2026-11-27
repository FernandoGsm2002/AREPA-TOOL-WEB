import { useEffect, useState } from "react";
import { Globe2, History, BadgeCheck, Download, LogOut, Loader2, ChevronRight, ShieldCheck, Settings2, BookOpen, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSession, clearSession, type WebUser } from "@/lib/web-session";
import CreateDns from "./views/CreateDns";
import MyOperations from "./views/MyOperations";
import AccountLicense from "./views/AccountLicense";
import InstallerAccessModal from "@/components/site/InstallerAccessModal";
import Downloads from "./views/Downloads";
import Tutorials from "./views/Tutorials";
import SamsungRootFiles from "./views/SamsungRootFiles";
import WelcomeConfetti from "./WelcomeConfetti";
import "@/styles/dashboard.css";

type Tab = "dns" | "operations" | "account" | "downloads" | "root-files" | "tutorials";

const tabs: { id: Tab; label: string; icon: typeof Globe2 }[] = [
  { id: "dns", label: "Crear DNS", icon: Globe2 },
  { id: "operations", label: "Mis Operaciones", icon: History },
  { id: "account", label: "Cuenta y Licencia", icon: BadgeCheck },
  { id: "downloads", label: "Descargas", icon: Download },
  { id: "root-files", label: "Samsung Root", icon: Smartphone },
  { id: "tutorials", label: "Tutoriales", icon: BookOpen },
];

export default function Dashboard() {
  const [user, setUser] = useState<WebUser | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("dns");

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setUser(session.user);
  }, []);

  function signOut() {
    clearSession();
    window.location.href = "/login";
  }

  if (user === undefined) {
    return (
      <div className="arepa-dashboard dashboard-loading">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="arepa-dashboard">
      <WelcomeConfetti username={user.username} />
      <aside className="dashboard-sidebar">
        <a href="/" className="dashboard-brand">
          <img src="/pngs/arepatool-logo-mark.webp" alt="" width="36" height="36" />
          ArepaTool
        </a>

        <nav className="dashboard-navigation" aria-label="Panel de control">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              aria-controls="dashboard-content"
              className="dashboard-nav-item"
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              <span>{label}</span>
              {tab === id && <ChevronRight className="dashboard-nav-chevron size-4" aria-hidden="true" />}
            </button>
          ))}
          {user.status === "admin" && (
            <a href="/admin" className="dashboard-nav-item dashboard-admin-link">
              <Settings2 className="size-[18px] shrink-0" aria-hidden="true" />
              Administración
            </a>
          )}
        </nav>

      </aside>

      <div className="dashboard-workspace">
        <header className="dashboard-topbar">
          <p className="dashboard-topbar-title">Panel de control</p>
          <div className="dashboard-session">
            <span className="dashboard-session-icon">
              <ShieldCheck className="size-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="dashboard-username text-sm font-medium">{user.username}</p>
              <p className="text-muted-foreground text-xs">Sesión protegida</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="dashboard-signout" onClick={signOut}>
            <LogOut className="size-4" aria-hidden="true" />
            Cerrar sesión
          </Button>
        </header>

        <main id="dashboard-content" className="dashboard-content" aria-label={tabs.find((item) => item.id === tab)?.label}>
          {tab === "dns" && <CreateDns />}
          {tab === "operations" && <MyOperations />}
          {tab === "account" && <AccountLicense />}
          {tab === "downloads" && <Downloads />}
          {tab === "root-files" && <SamsungRootFiles />}
          {tab === "tutorials" && <Tutorials />}
        </main>
      </div>
      <InstallerAccessModal />
    </div>
  );
}
