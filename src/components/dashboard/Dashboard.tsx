import { useEffect, useState } from "react";
import { Globe2, History, BadgeCheck, Download, LogOut, Loader2, ChevronRight, ShieldCheck, Settings2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSession, clearSession, type WebUser } from "@/lib/web-session";
import CreateDns from "./views/CreateDns";
import MyOperations from "./views/MyOperations";
import AccountLicense from "./views/AccountLicense";
import InstallerAccessModal from "@/components/site/InstallerAccessModal";
import Downloads from "./views/Downloads";
import Tutorials from "./views/Tutorials";
import WelcomeConfetti from "./WelcomeConfetti";

type Tab = "dns" | "operations" | "account" | "downloads" | "tutorials";

const tabs: { id: Tab; label: string; icon: typeof Globe2 }[] = [
  { id: "dns", label: "Crear DNS", icon: Globe2 },
  { id: "operations", label: "Mis Operaciones", icon: History },
  { id: "account", label: "Cuenta y Licencia", icon: BadgeCheck },
  { id: "downloads", label: "Descargas", icon: Download },
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="bg-background flex min-h-screen">
      <WelcomeConfetti username={user.username} />
      <aside className="border-border/70 bg-sidebar/95 sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-hidden border-r py-5 pr-4 pl-6 shadow-[12px_0_35px_rgba(0,0,0,0.12)] sm:flex">
        <a href="/" className="group mx-1 mb-6 block overflow-hidden rounded-xl border border-white/8 bg-linear-to-br from-white/8 to-transparent px-3 py-1.5 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-primary/10">
          <img src="/pngs/arepalanding.png" alt="ArepaTool" className="-my-7 h-28 w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
        </a>

        <div className="border-border/60 mx-1 border-t pt-5">
          <p className="text-muted-foreground mb-2 px-2 text-[0.65rem] font-semibold tracking-[0.16em] uppercase">Panel de control</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5 px-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`group flex items-center gap-2.5 rounded-lg border px-2.5 py-2.5 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                tab === id
                  ? "border-primary/55 bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-accent hover:text-foreground"
              }`}
            >
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${tab === id ? "bg-white/15" : "bg-muted/80 group-hover:bg-background"}`}>
                <Icon className="size-4" />
              </span>
              <span className="flex-1">{label}</span>
              {tab === id && <ChevronRight className="size-4 opacity-80" />}
            </button>
          ))}
          {user.status === "admin" && (
            <a href="/admin" className="text-muted-foreground hover:bg-accent hover:text-foreground group mt-4 flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2.5 text-sm font-medium transition-all duration-200 hover:border-border/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span className="bg-muted/80 group-hover:bg-background flex size-8 shrink-0 items-center justify-center rounded-lg"><Settings2 className="size-4" /></span>
              Administración
            </a>
          )}
        </nav>

        <div className="border-border/70 bg-muted/35 mx-1 mt-5 rounded-xl border p-3 shadow-lg shadow-black/5">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
              <ShieldCheck className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.username}</p>
              <p className="text-muted-foreground truncate text-xs">Sesión protegida</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground w-full justify-start" onClick={signOut}>
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="border-border/60 bg-sidebar/95 fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t p-2 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:hidden">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-label={label}
            className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[0.65rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              tab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(64,112,255,0.07),transparent_36rem)] p-6 pb-24 sm:p-10 sm:pb-10">
        {tab === "dns" && <CreateDns />}
        {tab === "operations" && <MyOperations />}
        {tab === "account" && <AccountLicense />}
        {tab === "downloads" && <Downloads />}
        {tab === "tutorials" && <Tutorials />}
      </main>
      <InstallerAccessModal />
    </div>
  );
}
