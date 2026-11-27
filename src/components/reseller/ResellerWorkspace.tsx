import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChartNoAxesCombined,
  ChevronRight,
  History,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Plug,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  resellerApi,
  clearResellerSession,
  ResellerApiError,
  type Reseller,
  type ResellerLanguage,
} from "../../lib/reseller-api";
import {
  money,
  normalizeLanguage,
  translator,
  type MessageKey,
} from "../../lib/reseller-i18n";
import {
  LanguageSelect,
  Loading,
  Notice,
  ResellerContext,
  errorText,
} from "./shared";
import Orders from "./Orders";
import { readPendingOrder } from "./pending-order";
import Reporting from "./Reporting";
import Ledger from "./Ledger";
import ApiConnection from "./ApiConnection";
import Announcements from "./Announcements";
import Security from "./Security";
const tabs = [
  "overview",
  "orders",
  "analytics",
  "history",
  "receipts",
  "api",
  "announcements",
  "security",
] as const;
type Tab = (typeof tabs)[number];
const icons: Record<Tab, LucideIcon> = {
  overview: LayoutDashboard,
  orders: ShoppingBag,
  analytics: ChartNoAxesCombined,
  history: History,
  receipts: ReceiptText,
  api: Plug,
  announcements: Bell,
  security: KeyRound,
};
export default function ResellerWorkspace() {
  const [reseller, setReseller] = useState<Reseller>();
  const [language, setLanguage] = useState<ResellerLanguage>("es");
  const t = translator(language);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [notice, setNotice] = useState<unknown>();
  const [tab, setTab] = useState<Tab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const menuRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    let active = true;
    resellerApi("me", {})
      .then((result) => {
        if (!active) return;
        if (!result.totpEnabled) {
          window.location.replace("/loginreseller");
          return;
        }
        setReseller(result.reseller);
        if (readPendingOrder(result.reseller.id)) setTab("orders");
        setLanguage(normalizeLanguage(result.reseller.language));
        setLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ResellerApiError && error.status === 401) {
          window.location.replace("/loginreseller");
          return;
        }
        setError(error);
        setNotice(error);
        setLoading(false);
      });
    const expired = () => {
      clearResellerSession();
      setReseller(undefined);
      window.location.replace("/loginreseller");
    };
    window.addEventListener("reseller:session-expired", expired);
    return () => {
      active = false;
      window.removeEventListener("reseller:session-expired", expired);
    };
  }, [refresh]);
  useEffect(() => {
    document.documentElement.lang = language === "pt-br" ? "pt-BR" : language;
  }, [language]);
  useEffect(() => {
    const onHash = () => {
      const value = window.location.hash.slice(1);
      if (tabs.includes(value as Tab)) setTab(value as Tab);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (menuOpen) menuRef.current?.showModal();
    else menuRef.current?.close();
  }, [menuOpen]);
  function select(value: Tab) {
    setTab(value);
    setMenuOpen(false);
    window.history.replaceState(null, "", `#${value}`);
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  async function changeLanguage(value: ResellerLanguage) {
    if (busy) return;
    setBusy(true);
    setNotice(undefined);
    try {
      const result = await resellerApi("preferences", { language: value });
      setLanguage(value);
      if (result.reseller) setReseller(result.reseller);
    } catch (error) {
      setNotice(error);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (busy) return;
    setBusy(true);
    setNotice(undefined);
    try {
      await resellerApi("logout", {});
      setReseller(undefined);
      window.location.replace("/loginreseller");
    } catch (error) {
      setNotice(error);
    } finally {
      setBusy(false);
    }
  }
  function updateProfile(value: Partial<Reseller>) {
    setReseller((current) => (current ? { ...current, ...value } : current));
  }
  const navigation = (
    <nav aria-label={t("workspace")} className="rs-nav">
      {tabs.map((value) => {
        const Icon = icons[value];
        return (
          <a
            key={value}
            href={`#${value}`}
            aria-current={value === tab ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              select(value);
            }}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{t(value)}</span>
            {value === tab && (
              <ChevronRight
                size={14}
                className="rs-nav-chevron"
                aria-hidden="true"
              />
            )}
          </a>
        );
      })}
    </nav>
  );
  return (
    <ResellerContext.Provider value={{ language, t }}>
      <div className="rs-root">
        {loading ? (
          <main className="rs-session-gate">
            <Loading />
          </main>
        ) : !reseller ? (
          <main className="rs-session-gate">
            <h1>{t("workspace")}</h1>
            <Notice>{error ? errorText(error, t) : t("sessionExpired")}</Notice>
            <button
              className="rs-button"
              onClick={() => {
                setLoading(true);
                setError(undefined);
                setRefresh((value) => value + 1);
              }}
            >
              {t("retry")}
            </button>
            <a href="/loginreseller">{t("login")}</a>
          </main>
        ) : (
          <>
            <a className="rs-skip" href="#reseller-main">
              {t("skip")}
            </a>
            <div className="rs-shell">
              <aside className="rs-sidebar">
                <a href="/" className="rs-brand">
                  <img
                    src="/pngs/arepatool-logo-mark.webp"
                    width="34"
                    height="34"
                    alt=""
                  />
                  <span>
                    ArepaTool<small>{t("workspace")}</small>
                  </span>
                </a>
                {navigation}
                <div className="rs-sidebar-bottom">
                  <span
                    className={`rs-tag ${reseller.apiPaused ? "rs-tag--warning" : "rs-tag--success"}`}
                  >
                    {t(reseller.apiPaused ? "apiPaused" : "apiActive")}
                  </span>
                  <p>
                    <strong>{reseller.name || reseller.username}</strong>
                    <span>{reseller.username}</span>
                  </p>
                  <button
                    className="rs-button rs-quiet"
                    disabled={busy}
                    onClick={logout}
                  >
                    <LogOut size={17} aria-hidden="true" />
                    {t("signOut")}
                  </button>
                </div>
              </aside>
              <div className="rs-workspace">
                <header className="rs-topbar">
                  <button
                    className="rs-icon-button rs-mobile-menu"
                    aria-label={t("menu")}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(true)}
                  >
                    <Menu size={22} />
                  </button>
                  <span className="rs-topbar-title">{t("workspace")}</span>
                  <div className="rs-topbar-tools">
                    <span className="rs-topbar-balance">
                      <span>{t("balance")}</span>
                      <strong>{money(reseller.balance, language)}</strong>
                    </span>
                    <LanguageSelect
                      language={language}
                      onChange={changeLanguage}
                      disabled={busy}
                    />
                  </div>
                </header>
                <main id="reseller-main" className="rs-main">
                  <div className="rs-page-heading">
                    <div>
                      <h1 tabIndex={-1} ref={headingRef}>
                        {t(tab)}
                      </h1>
                      <p>{t(`${tab}Intro` as MessageKey)}</p>
                    </div>
                    <button
                      className="rs-button rs-secondary rs-refresh"
                      onClick={() => {
                        setRefresh((value) => value + 1);
                        setNotice(undefined);
                      }}
                    >
                      <RefreshCw size={16} aria-hidden="true" />
                      {t("refresh")}
                    </button>
                  </div>
                  <Notice>{notice ? errorText(notice, t) : null}</Notice>
                  <div hidden={tab !== "orders"}>
                    <Orders
                      resellerId={reseller.id}
                      onBalance={(balance) => updateProfile({ balance })}
                    />
                  </div>
                  {tab === "overview" && (
                    <Reporting
                      key={`overview-${refresh}`}
                      reseller={reseller}
                      onOrder={() => select("orders")}
                    />
                  )}
                  {tab === "analytics" && (
                    <Reporting
                      key={`analytics-${refresh}`}
                      reseller={reseller}
                      analytics
                      onOrder={() => select("orders")}
                    />
                  )}
                  {tab === "history" && <Ledger key={`history-${refresh}`} />}
                  {tab === "receipts" && (
                    <Ledger key={`receipts-${refresh}`} receipts />
                  )}
                  {tab === "api" && (
                    <ApiConnection
                      key={`api-${refresh}`}
                      onPaused={(apiPaused) => updateProfile({ apiPaused })}
                    />
                  )}
                  {tab === "announcements" && (
                    <Announcements key={`announcements-${refresh}`} />
                  )}
                  {tab === "security" && (
                    <Security
                      key={`security-${refresh}`}
                      reseller={reseller}
                      onProfile={updateProfile}
                    />
                  )}
                </main>
              </div>
            </div>
            <dialog
              className="rs-mobile-drawer"
              ref={menuRef}
              onCancel={(event) => {
                event.preventDefault();
                setMenuOpen(false);
              }}
            >
              <div className="rs-modal-header">
                <strong>ArepaTool</strong>
                <button
                  className="rs-icon-button"
                  aria-label={t("close")}
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={22} />
                </button>
              </div>
              {navigation}
              <button
                className="rs-button rs-quiet"
                disabled={busy}
                onClick={logout}
              >
                <LogOut size={17} aria-hidden="true" />
                {t("signOut")}
              </button>
            </dialog>
          </>
        )}
      </div>
    </ResellerContext.Provider>
  );
}
