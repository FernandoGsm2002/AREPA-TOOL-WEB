import { useEffect, useState } from "react";
import { Globe2, History, BadgeCheck, Download, LogOut, Loader2, ChevronRight, ShieldCheck, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSession, clearSession, type WebUser } from "@/lib/web-session";
import CreateDns from "./views/CreateDns";
import MyOperations from "./views/MyOperations";
import AccountLicense from "./views/AccountLicense";
import Downloads from "./views/Downloads";

type Tab = "dns" | "operations" | "account" | "downloads";

const tabs: { id: Tab; label: string; icon: typeof Globe2 }[] = [
  { id: "dns", label: "Crear DNS", icon: Globe2 },
  { id: "operations", label: "Mis Operaciones", icon: History },
  { id: "account", label: "Cuenta y Licencia", icon: BadgeCheck },
  { id: "downloads", label: "Descargas", icon: Download },
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
      <aside className="border-border/70 bg-card/80 hidden w-72 shrink-0 flex-col border-r p-4 shadow-2xl shadow-black/10 sm:flex">
        <a href="/" className="group mb-8 block overflow-hidden rounded-xl border border-white/8 bg-linear-to-br from-white/8 to-transparent px-3 py-1.5 transition-colors hover:border-primary/35">
          <img src="/pngs/arepalanding.png" alt="ArepaTool" className="-my-7 h-28 w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
        </a>

        <p className="text-muted-foreground mb-2 px-3 text-[0.65rem] font-semibold tracking-[0.16em] uppercase">Panel de control</p>
        <nav className="flex flex-1 flex-col gap-1.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all duration-200 ${
                tab === id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tab === id ? "bg-white/15" : "bg-muted/80 group-hover:bg-background"}`}>
                <Icon className="size-4" />
              </span>
              <span className="flex-1">{label}</span>
              {tab === id && <ChevronRight className="size-4 opacity-80" />}
            </button>
          ))}
          {user.status === "admin" && (
            <a href="/admin" className="text-muted-foreground hover:bg-accent hover:text-foreground group mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200">
              <span className="bg-muted/80 group-hover:bg-background flex size-8 shrink-0 items-center justify-center rounded-lg"><Settings2 className="size-4" /></span>
              Administración
            </a>
          )}
        </nav>

        <div className="border-border/70 bg-muted/35 mt-5 rounded-xl border p-3">
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

      <div className="border-border/60 bg-card/95 fixed inset-x-0 bottom-0 z-40 flex justify-around border-t p-2 backdrop-blur-xl sm:hidden">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-label={label}
            className={`flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[0.65rem] ${
              tab === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-6 pb-24 sm:p-10 sm:pb-10">
        {tab === "dns" && <CreateDns />}
        {tab === "operations" && <MyOperations />}
        {tab === "account" && <AccountLicense />}
        {tab === "downloads" && <Downloads />}
      </main>
    </div>
  );
}
