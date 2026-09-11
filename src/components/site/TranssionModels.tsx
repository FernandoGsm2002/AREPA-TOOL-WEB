import { useEffect, useMemo, useState } from "react";
import { HardDriveDownload, LoaderCircle, RotateCcw, ShieldCheck, WalletCards } from "lucide-react";

const API_BASE = "https://api2.arepatool.com";
const brands = ["Todos", "Infinix", "Tecno", "Itel"] as const;
type Brand = (typeof brands)[number];

type Rom = {
  id: string;
  name: string;
  deviceModel: string;
  androidVersion: string | null;
};

const operations = [
  { label: "FRP", icon: ShieldCheck },
  { label: "Factory Reset", icon: RotateCcw },
  { label: "PayJoy", icon: WalletCards },
  { label: "ROM Patch · Security Plugin", icon: HardDriveDownload },
];

function brandFor(name: string): Exclude<Brand, "Todos"> {
  const value = name.toLowerCase();
  if (value.includes("tecno")) return "Tecno";
  if (value.includes("itel")) return "Itel";
  return "Infinix";
}

export default function TranssionModels() {
  const [roms, setRoms] = useState<Rom[]>([]);
  const [brand, setBrand] = useState<Brand>("Todos");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/rom/catalog/public`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("catalog_unavailable")))
      .then((data) => {
        if (!data?.success || !Array.isArray(data.roms)) throw new Error("catalog_invalid");
        setRoms(data.roms);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const visibleRoms = useMemo(
    () => brand === "Todos" ? roms : roms.filter((rom) => brandFor(rom.name) === brand),
    [brand, roms],
  );

  return (
    <section id="transsion" className="mt-16 border-t border-border/70 pt-10" aria-labelledby="transsion-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="transsion-title" className="font-display text-2xl font-bold tracking-tight text-white">Infinix · Tecno · Itel</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Modelos ROM Patch sincronizados desde el catálogo de soporte.</p>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {loading ? "Sincronizando…" : `${roms.length} ROMs activas`}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Operaciones soportadas">
        {operations.map(({ label, icon: Icon }) => (
          <span key={label} className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground">
            <Icon className="size-3.5 text-primary" />
            {label}
          </span>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Filtrar por marca">
        {brands.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={brand === item}
            onClick={() => setBrand(item)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${brand === item ? "border-primary/50 bg-primary text-primary-foreground" : "border-border/80 bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-5 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin text-primary" /> Cargando modelos disponibles…
        </div>
      )}

      {failed && (
        <p className="mt-5 rounded-xl border border-border/70 bg-card px-4 py-5 text-sm text-muted-foreground">No se pudo sincronizar el catálogo en este momento. Intenta actualizar la página.</p>
      )}

      {!loading && !failed && visibleRoms.length === 0 && (
        <p className="mt-5 rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">Aún no hay ROM Patch publicadas para {brand}.</p>
      )}

      {!loading && !failed && visibleRoms.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleRoms.map((rom) => {
            const romBrand = brandFor(rom.name);
            return (
              <article key={rom.id} className="border-border/70 bg-card rounded-xl border p-4 shadow-lg shadow-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-primary/10">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide text-primary uppercase">{romBrand}</span>
                  {rom.androidVersion && <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">Android {rom.androidVersion}</span>}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{rom.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Modelo: {rom.deviceModel}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
