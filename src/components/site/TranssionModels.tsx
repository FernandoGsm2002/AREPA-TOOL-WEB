import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Flame, HardDriveDownload, LoaderCircle, LockKeyhole, RotateCcw, Search, ShieldCheck, WalletCards } from "lucide-react";

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
  { label: "FRP", icon: ShieldCheck, target: "transsion-meta-support" },
  { label: "Factory Reset", icon: RotateCcw, target: "transsion-meta-support" },
  { label: "PayJoy", icon: WalletCards, target: "transsion-meta-support" },
  { label: "Security Plugin", icon: HardDriveDownload, target: "transsion-rom-support" },
];

const metaModels: { brand: Exclude<Brand, "Todos">; name: string }[] = [
  { brand: "Infinix", name: "Smart 8" },
  { brand: "Infinix", name: "Smart 8 Pro" },
  { brand: "Infinix", name: "Smart 9 HD" },
  { brand: "Infinix", name: "HOT 40i" },
  { brand: "Infinix", name: "HOT 50i" },
  { brand: "Infinix", name: "NOTE 50" },
  { brand: "Infinix", name: "NOTE 50 Pro" },
  { brand: "Infinix", name: "NOTE 50X 5G" },
  { brand: "Infinix", name: "NOTE 50 Pro+ 5G" },
  { brand: "Tecno", name: "Camon 20" },
  { brand: "Tecno", name: "Camon 20 Pro" },
  { brand: "Tecno", name: "Camon 30 5G" },
  { brand: "Tecno", name: "Camon 30S Pro" },
  { brand: "Tecno", name: "Spark 20C" },
  { brand: "Tecno", name: "Spark 20 Pro+" },
  { brand: "Tecno", name: "Spark Go 2024" },
  { brand: "Tecno", name: "Pova 6" },
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [activeOperation, setActiveOperation] = useState("Security Plugin");

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

  const normalizedSearch = search.trim().toLowerCase();
  const visibleMetaModels = useMemo(() => metaModels.filter((model) =>
    (brand === "Todos" || model.brand === brand) && (!normalizedSearch || `${model.brand} ${model.name}`.toLowerCase().includes(normalizedSearch)),
  ), [brand, normalizedSearch]);
  const visibleRoms = useMemo(() => roms.filter((rom) =>
    (brand === "Todos" || brandFor(rom.name) === brand) && (!normalizedSearch || `${rom.name} ${rom.deviceModel} ${rom.androidVersion ?? ""}`.toLowerCase().includes(normalizedSearch)),
  ), [brand, normalizedSearch, roms]);

  function focusOperation(label: string, target: string) {
    setActiveOperation(label);
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="transsion" className="transsion-stage" aria-labelledby="transsion-title">
      <div className="transsion-header">
        <div>
          <h2 id="transsion-title">Infinix · Tecno · Itel</h2>
          <p>ROM Patch Fastboot y operaciones Meta para dispositivos Transsion.</p>
        </div>
        <span className="transsion-count">
          {loading ? "Sincronizando ROM Patch…" : `${metaModels.length} Meta · ${roms.length} ROM Patch`}
        </span>
      </div>

      <div className="transsion-operations" aria-label="Operaciones soportadas">
        {operations.map(({ label, icon: Icon, target }) => (
          <button
            key={label}
            type="button"
            className={activeOperation === label ? "is-selected" : ""}
            aria-pressed={activeOperation === label}
            onClick={() => focusOperation(label, target)}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="transsion-controls">
        <label className="transsion-search">
          <Search className="size-4" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Buscar modelo, código o Android" aria-label="Buscar modelo Transsion" />
        </label>
        <div className="transsion-filter" role="group" aria-label="Filtrar por marca">
        {brands.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={brand === item}
            onClick={() => setBrand(item)}
            className={brand === item ? "is-selected" : ""}
          >
            {item}
          </button>
        ))}
        </div>
      </div>

      <section id="transsion-rom-support" className="transsion-rom-stage" aria-labelledby="transsion-rom-title">
      <div className="transsion-heading transsion-rom-heading"><span id="transsion-rom-title"><Flame className="size-3.5" /> ROM Patch vía Fastboot <b>NEW</b></span><i></i><small>{loading ? "…" : visibleRoms.length}</small></div>
      <div className="transsion-rom-notice">
        <div><BadgeCheck className="size-4" /><strong>ROMs completamente testeadas</strong><span>Security Plugin · Fastboot</span></div>
        <p><LockKeyhole className="size-4" /><b>Requisito obligatorio:</b> bootloader desbloqueado. ArepaTool no desbloquea el bootloader.</p>
      </div>

      {loading && (
        <div className="transsion-state">
          <LoaderCircle className="size-4 animate-spin" /> Cargando modelos disponibles…
        </div>
      )}

      {failed && (
        <p className="transsion-state">No se pudo sincronizar el catálogo en este momento. Intenta actualizar la página.</p>
      )}

      {!loading && !failed && visibleRoms.length === 0 && (
        <p className="transsion-state is-empty">Aún no hay ROM Patch publicadas con esa búsqueda.</p>
      )}

      {!loading && !failed && visibleRoms.length > 0 && (
        <div className="transsion-grid">
          {visibleRoms.map((rom) => {
            const romBrand = brandFor(rom.name);
            return (
              <article key={rom.id} className="transsion-card">
                <div className="transsion-meta">
                  <span className="transsion-brand">{romBrand} · FASTBOOT</span>
                  {rom.androidVersion && <span>Android {rom.androidVersion}</span>}
                </div>
                <h3>{rom.name}</h3>
                <p>Modelo: {rom.deviceModel} · ROM Patch</p>
              </article>
            );
          })}
        </div>
      )}
      </section>

      <section id="transsion-meta-support" className="transsion-meta-stage" aria-labelledby="transsion-meta-title">
      <div className="transsion-heading"><span id="transsion-meta-title">Operaciones vía Meta</span><i></i><small>{visibleMetaModels.length}</small></div>
      <p className="transsion-caption">FRP, Factory Reset y PayJoy disponibles en modo Meta.</p>
      {visibleMetaModels.length === 0 ? (
        <p className="transsion-state is-empty">No encontramos modelos Meta con esa búsqueda.</p>
      ) : (
        <div className="transsion-grid">
          {visibleMetaModels.map((model) => (
            <article key={`${model.brand}-${model.name}`} className="transsion-card">
              <div className="transsion-meta"><span className="transsion-brand">{model.brand}</span><span>META</span></div>
              <h3>{model.name}</h3>
              <p className="transsion-card-operations">FRP · Factory Reset · PayJoy</p>
            </article>
          ))}
        </div>
      )}
      </section>
    </section>
  );
}
