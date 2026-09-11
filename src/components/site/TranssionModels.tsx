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
    <section id="transsion" className="transsion-stage" aria-labelledby="transsion-title">
      <div className="transsion-header">
        <div>
          <h2 id="transsion-title">Infinix · Tecno · Itel</h2>
          <p>Modelos ROM Patch sincronizados desde el catálogo de soporte.</p>
        </div>
        <span className="transsion-count">
          {loading ? "Sincronizando…" : `${roms.length} ROMs activas`}
        </span>
      </div>

      <div className="transsion-operations" aria-label="Operaciones soportadas">
        {operations.map(({ label, icon: Icon }) => (
          <span key={label}>
            <Icon className="size-3.5" />
            {label}
          </span>
        ))}
      </div>

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

      {loading && (
        <div className="transsion-state">
          <LoaderCircle className="size-4 animate-spin" /> Cargando modelos disponibles…
        </div>
      )}

      {failed && (
        <p className="transsion-state">No se pudo sincronizar el catálogo en este momento. Intenta actualizar la página.</p>
      )}

      {!loading && !failed && visibleRoms.length === 0 && (
        <p className="transsion-state is-empty">Aún no hay ROM Patch publicadas para {brand}.</p>
      )}

      {!loading && !failed && visibleRoms.length > 0 && (
        <div className="transsion-grid">
          {visibleRoms.map((rom) => {
            const romBrand = brandFor(rom.name);
            return (
              <article key={rom.id} className="transsion-card">
                <div className="transsion-meta">
                  <span className="transsion-brand">{romBrand}</span>
                  {rom.androidVersion && <span>Android {rom.androidVersion}</span>}
                </div>
                <h3>{rom.name}</h3>
                <p>Modelo: {rom.deviceModel}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
