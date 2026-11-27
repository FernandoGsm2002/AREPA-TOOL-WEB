import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, Copy, LoaderCircle, LogOut, Megaphone, Pencil, Pin, Plus, ShieldCheck } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadSession, webApiFetch } from "@/lib/web-session";
import "./ResellerPortalAdmin.css";

type Announcement = {
  id: string; title: string; body: string; pinned: boolean; published: boolean; createdAt: string;
};
type AnnouncementDraft = Omit<Announcement, "id" | "createdAt"> & { id?: string };
type PortalAccount = {
  id: string; username: string; name: string; email: string | null; status: string;
  apiPaused: boolean; totpEnabled: boolean; lastLoginAt: string | null; sessionCount: number;
  telegramChatId: string | null; enrollmentApproved: boolean;
};
type AccountAction = { account: PortalAccount; kind: "revoke" | "reset-otp" | "reset-password" | "api-pause" | "approve-access" };
type Receipt = {
  id: string; amount: number | string; balanceBefore: number | string; balanceAfter: number | string;
  createdAt: string; description: string;
};
type ResellerIdentity = { id: string; name: string; username: string };
type TopUpIntent = { resellerId: string; amount: number; description: string; idempotencyKey: string };

const displayDate = (value: string | null) => value ? new Date(value).toLocaleString("es-PE") : "Sin accesos";
const displayMoney = (value: number | string) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" }).format(Number(value));
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;
const blankAnnouncement = (): AnnouncementDraft => ({ title: "", body: "", pinned: false, published: false });
const announcementPayload = (item: AnnouncementDraft): AnnouncementDraft => ({
  ...(item.id ? { id: item.id } : {}), title: item.title, body: item.body, pinned: item.pinned, published: item.published,
});

// Authorization, including the administrator's OTP, is always checked by these admin endpoints.
async function adminRequest(path: string, body: Record<string, unknown>, onSessionExpired: () => void) {
  const result = await webApiFetch(`/api/admin/${path}`, body);
  if (!result) {
    onSessionExpired();
    throw new Error("La sesión administrativa terminó. Inicia sesión de nuevo.");
  }
  if (!result.success) throw new Error(result.error || "No se pudo completar la acción.");
  return result;
}

function PortalDialog({ open, onClose, title, description, busy, children }: {
  open: boolean; onClose: () => void; title: string; description: string; busy: boolean; children: ReactNode;
}) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return <DialogPrimitive.Root open={open} onOpenChange={next => { if (!next && !busy) onClose(); }}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="rp-admin-overlay" />
      <DialogPrimitive.Content className="rp-admin-dialog"
        onOpenAutoFocus={event => {
          returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          event.preventDefault();
          (event.currentTarget as HTMLElement).querySelector<HTMLElement>("[data-initial-focus]")?.focus();
        }}
        onCloseAutoFocus={event => {
          event.preventDefault();
          // Approval removes its trigger; return to the account search in that case.
          const target = returnFocus.current?.isConnected ? returnFocus.current : document.getElementById("rp-account-search");
          target?.focus();
        }}
        onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
        onInteractOutside={event => event.preventDefault()}>
        <DialogPrimitive.Title className="rp-admin-dialog-title">{title}</DialogPrimitive.Title>
        <DialogPrimitive.Description className="rp-admin-hint">{description}</DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}

export default function ResellerPortalAdmin({ reloadKey, onSessionExpired }: {
  reloadKey: number; onSessionExpired: () => void;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [accounts, setAccounts] = useState<PortalAccount[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState("");
  const [accountsError, setAccountsError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<AnnouncementDraft | null>(null);
  const originalDraft = useRef("");
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const savingAnnouncementRef = useRef(false);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<AccountAction | null>(null);
  const [code, setCode] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const actionBusyRef = useRef(false);
  const announcementRequest = useRef(0);
  const accountRequest = useRef(0);

  const loadAnnouncements = useCallback(async () => {
    if (savingAnnouncementRef.current) return;
    const request = ++announcementRequest.current;
    setAnnouncementsLoading(true); setAnnouncementsError("");
    try {
      const data = await adminRequest("reseller-portal/announcements/list", {}, onSessionExpired);
      if (request === announcementRequest.current) setAnnouncements(data.items);
    } catch (error) {
      if (request === announcementRequest.current) setAnnouncementsError(errorMessage(error, "No se pudieron cargar los anuncios. Usa Actualizar para reintentar."));
    } finally {
      if (request === announcementRequest.current) setAnnouncementsLoading(false);
    }
  }, [onSessionExpired]);

  const loadAccounts = useCallback(async () => {
    if (actionBusyRef.current) return;
    const request = ++accountRequest.current;
    setAccountsLoading(true); setAccountsError("");
    try {
      const data = await adminRequest("reseller-portal/accounts", {}, onSessionExpired);
      if (request === accountRequest.current) setAccounts(data.items);
    } catch (error) {
      if (request === accountRequest.current) setAccountsError(errorMessage(error, "No se pudieron cargar las cuentas. Usa Actualizar para reintentar."));
    } finally {
      if (request === accountRequest.current) setAccountsLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void loadAnnouncements(); void loadAccounts();
    return () => { ++announcementRequest.current; ++accountRequest.current; };
  }, [reloadKey, loadAnnouncements, loadAccounts]);

  const changeDraft = (item: AnnouncementDraft | null) => {
    if (draft && JSON.stringify(draft) !== originalDraft.current && !window.confirm("¿Descartar los cambios sin guardar de este anuncio?")) return;
    const next = item ? announcementPayload(item) : null;
    originalDraft.current = JSON.stringify(next);
    setDraft(next); setAnnouncementsError("");
    if (next) requestAnimationFrame(() => editorHeading.current?.focus());
  };

  const saveAnnouncement = async (item: AnnouncementDraft, fromEditor = false) => {
    if (savingAnnouncementRef.current) return;
    const payload = { ...announcementPayload(item), title: item.title.trim(), body: item.body.trim() };
    if (!payload.title || !payload.body || payload.title.length > 160 || payload.body.length > 6000) {
      setAnnouncementsError("Escribe un título de hasta 160 caracteres y un mensaje de hasta 6000 caracteres."); return;
    }
    savingAnnouncementRef.current = true; setSavingAnnouncement(true); setAnnouncementsError(""); setNotice("");
    ++announcementRequest.current;
    try {
      const data = await adminRequest("reseller-portal/announcements/save", payload, onSessionExpired);
      const saved = data.item as Announcement;
      setAnnouncements(current => [saved, ...current.filter(existing => existing.id !== saved.id)]);
      if (fromEditor) { setDraft(null); originalDraft.current = "null"; }
      setNotice(saved.published ? "Anuncio publicado en el portal de revendedores." : "Anuncio guardado sin publicar. No se muestra en el portal.");
    } catch (error) {
      setAnnouncementsError(errorMessage(error, "No se pudo guardar el anuncio. Tus cambios se conservan."));
    } finally { savingAnnouncementRef.current = false; setSavingAnnouncement(false); }
  };

  const openAction = (account: PortalAccount, kind: AccountAction["kind"]) => {
    setAction({ account, kind }); setCode(""); setActionError(""); setNotice("");
  };
  const closeAction = () => { if (!actionBusyRef.current) { setAction(null); setCode(""); setActionError(""); } };
  const performAction = async (event: FormEvent) => {
    event.preventDefault();
    if (!action || actionBusyRef.current) return;
    if (action.kind === "approve-access" && !action.account.telegramChatId?.trim()) {
      setActionError("El revendedor debe vincular Telegram antes de aprobar su acceso."); return;
    }
    if (action.kind !== "revoke" && !/^\d{6}$/.test(code)) { setActionError("Ingresa tu código de administrador de 6 dígitos."); return; }
    actionBusyRef.current = true; setActionBusy(true); setActionError("");
    ++accountRequest.current;
    try {
      await adminRequest(`reseller-portal/${action.kind}`, {
        resellerId: action.account.id,
        ...(action.kind !== "revoke" ? { code } : {}),
        ...(action.kind === "api-pause" ? { paused: !action.account.apiPaused } : {}),
      }, onSessionExpired);
      setAccounts(current => current.map(account => account.id !== action.account.id ? account : {
        ...account,
        ...(action.kind === "api-pause" ? { apiPaused: !action.account.apiPaused } : { sessionCount: 0 }),
        ...(action.kind === "reset-otp" ? { totpEnabled: false } : {}),
        ...(action.kind === "approve-access" ? { enrollmentApproved: true } : {}),
      }));
      setNotice(action.kind === "approve-access" ? `Acceso aprobado para ${action.account.username}, Telegram ID ${action.account.telegramChatId}. Se cerraron sus sesiones web y se cancelaron sus verificaciones pendientes.`
        : action.kind === "reset-otp" ? `2FA restablecido para ${action.account.username}. Debe configurarlo de nuevo al entrar al portal.`
        : action.kind === "reset-password" ? `Contraseña restablecida para ${action.account.username}. Podrá entrar con su API key y se cerraron sus sesiones web.`
        : action.kind === "revoke" ? `Sesiones web cerradas para ${action.account.username}.`
          : `API ${action.account.apiPaused ? "reanudada" : "pausada"} para ${action.account.username}.`);
      setAction(null); setCode("");
      actionBusyRef.current = false;
      void loadAccounts();
    } catch (error) {
      setActionError(errorMessage(error, "No se pudo confirmar la acción. Actualiza las cuentas antes de reintentar."));
      setCode("");
    } finally { actionBusyRef.current = false; setActionBusy(false); }
  };

  const query = search.trim().toLocaleLowerCase("es");
  const filteredAccounts = accounts.filter(account => [account.name, account.username, account.email, account.id]
    .some(value => value?.toLocaleLowerCase("es").includes(query)));
  const actionLabel = action?.kind === "approve-access" ? "Aprobar acceso"
    : action?.kind === "reset-otp" ? "Restablecer 2FA"
    : action?.kind === "reset-password" ? "Restablecer contraseña"
    : action?.kind === "revoke" ? "Cerrar sesiones web" : action?.account.apiPaused ? "Reanudar API" : "Pausar API";
  const actionDescription = !action ? "" : action.kind === "approve-access"
    ? "Verifica por un medio independiente que este ID de Telegram pertenezca al revendedor antes de aprobar su acceso al portal. Se cerrarán sus sesiones web y se cancelarán las verificaciones pendientes. Un cambio de Telegram requerirá una nueva aprobación."
    : action.kind === "reset-otp"
    ? `Se eliminará la configuración 2FA de ${action.account.username} y se cerrarán todas sus sesiones web. Tendrá que configurar 2FA otra vez. Su API key y su saldo se conservan.`
    : action.kind === "reset-password" ? `Se eliminará la contraseña personalizada del portal de ${action.account.username}. Podrá volver a entrar usando su API key como contraseña, sin recuperación por correo. Se cerrarán todas sus sesiones web. Su configuración 2FA, su API key y su saldo se conservan.`
    : action.kind === "revoke" ? `Se cerrarán todas las sesiones web de ${action.account.username}. Podrá volver a iniciar sesión con sus credenciales. Su API key, su configuración 2FA y su saldo se conservan.`
      : action.account.apiPaused ? `Se reanudará el acceso por API de ${action.account.username}. Las integraciones podrán volver a realizar operaciones.`
        : `Se pausará el acceso por API de ${action.account.username}. Sus integraciones dejarán de poder realizar operaciones mientras esté pausado. Su acceso web, su API key y su saldo se conservan.`;

  return <div className="rp-admin">
    {notice && <p className="rp-admin-notice" role="status">{notice}</p>}
    <section className="rp-admin-section" aria-labelledby="rp-announcements-heading" aria-busy={announcementsLoading || savingAnnouncement}>
      <div className="rp-admin-section-heading">
        <div><h2 id="rp-announcements-heading"><Megaphone aria-hidden="true" />Anuncios del portal</h2>
          <p>Publica novedades para los revendedores. Los anuncios fijados aparecen primero.</p></div>
        <Button disabled={savingAnnouncement} onClick={() => changeDraft(blankAnnouncement())}><Plus aria-hidden="true" />Nuevo anuncio</Button>
      </div>
      {announcementsError && <p className="rp-admin-error" role="alert">{announcementsError}</p>}
      {draft && <form className="rp-admin-editor" onSubmit={event => { event.preventDefault(); void saveAnnouncement(draft, true); }}>
        <h3 ref={editorHeading} tabIndex={-1}>{draft.id ? "Editar anuncio" : "Nuevo anuncio"}</h3>
        <p className="rp-admin-hint">Texto plano. Puedes incluir contenido en español, inglés o portugués.</p>
        <fieldset disabled={savingAnnouncement || announcementsLoading}>
          <label htmlFor="rp-announcement-title">Título</label>
          <Input id="rp-announcement-title" required maxLength={160} value={draft.title} aria-describedby="rp-title-count"
            onChange={event => setDraft({ ...draft, title: event.target.value })} />
          <span id="rp-title-count" className="rp-admin-count">{draft.title.length}/160 caracteres</span>
          <label htmlFor="rp-announcement-body">Mensaje</label>
          <textarea id="rp-announcement-body" required maxLength={6000} rows={8} value={draft.body} aria-describedby="rp-body-count"
            onChange={event => setDraft({ ...draft, body: event.target.value })} />
          <span id="rp-body-count" className="rp-admin-count">{draft.body.length}/6000 caracteres</span>
          <div className="rp-admin-options">
            <label><input type="checkbox" checked={draft.pinned} onChange={event => setDraft({ ...draft, pinned: event.target.checked })} />Fijar al inicio</label>
            <label><input type="checkbox" checked={draft.published} onChange={event => setDraft({ ...draft, published: event.target.checked })} />Publicado en el portal</label>
          </div>
          <div className="rp-admin-actions">
            <Button type="submit">{savingAnnouncement && <LoaderCircle className="animate-spin" aria-hidden="true" />}{savingAnnouncement ? "Guardando…" : draft.published ? "Guardar y publicar" : "Guardar sin publicar"}</Button>
            <Button type="button" variant="outline" onClick={() => changeDraft(null)}>Cancelar</Button>
          </div>
        </fieldset>
      </form>}
      {announcementsLoading && <p className="rp-admin-hint" role="status">Cargando anuncios…</p>}
      {!announcementsLoading && !announcementsError && announcements.length === 0 && <p className="rp-admin-empty">Aún no hay anuncios. Crea uno para compartir novedades en el portal.</p>}
      <div className="rp-admin-announcements">{[...announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)).map(item =>
        <article key={item.id} className="rp-admin-announcement">
          <div className="rp-admin-section-heading">
            <h3 dir="auto">{item.title}</h3>
            <div className="rp-admin-badges"><span className={`rp-admin-badge ${item.published ? "rp-admin-success" : ""}`}>{item.published ? "Publicado" : "Sin publicar"}</span>
              {item.pinned && <span className="rp-admin-badge"><Pin aria-hidden="true" />Fijado</span>}</div>
          </div>
          <p className="rp-admin-announcement-body" dir="auto">{item.body}</p>
          <div className="rp-admin-section-heading">
            <p className="rp-admin-hint">Creado: {displayDate(item.createdAt)}</p>
            <div className="rp-admin-actions">
              <Button size="sm" variant="outline" disabled={savingAnnouncement || announcementsLoading} onClick={() => changeDraft(item)} aria-label={`Editar anuncio: ${item.title}`}><Pencil aria-hidden="true" />Editar</Button>
              <Button size="sm" variant="outline" disabled={savingAnnouncement || announcementsLoading || draft?.id === item.id}
                onClick={() => void saveAnnouncement({ ...item, published: !item.published })} aria-label={`${item.published ? "Quitar publicación de" : "Publicar"} ${item.title}`}>{item.published ? "Quitar publicación" : "Publicar"}</Button>
            </div>
          </div>
        </article>)}</div>
    </section>

    <section className="rp-admin-section" aria-labelledby="rp-accounts-heading" aria-busy={accountsLoading}>
      <div className="rp-admin-section-heading"><div><h2 id="rp-accounts-heading"><ShieldCheck aria-hidden="true" />Acceso de revendedores</h2>
        <p>Administra las sesiones web, la verificación en dos pasos y el acceso por API.</p></div></div>
      <label className="rp-admin-search" htmlFor="rp-account-search">Buscar por nombre, usuario, correo o ID
        <Input id="rp-account-search" type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
      {accountsError && <p className="rp-admin-error" role="alert">{accountsError}</p>}
      {accountsLoading && <p className="rp-admin-hint" role="status">Cargando cuentas…</p>}
      <div className="rp-admin-table-region" role="region" aria-label="Cuentas de revendedores" tabIndex={0}>
        <table><caption className="sr-only">Estado de cuenta, API y seguridad de los revendedores</caption>
          <thead><tr><th scope="col">Revendedor</th><th scope="col">Cuenta</th><th scope="col">API</th><th scope="col">Acceso web</th><th scope="col">Acciones</th></tr></thead>
          <tbody>{filteredAccounts.map(account => <tr key={account.id}>
            <td><strong>{account.name || account.username}</strong><span className="rp-admin-detail">{account.username}</span>
              <span className="rp-admin-detail">{account.email || "Sin correo"}</span><span className="rp-admin-identifier">{account.id}</span>
              <span className="rp-admin-detail">Telegram ID: <code>{account.telegramChatId?.trim() || "Sin vincular"}</code></span></td>
            <td><span className={`rp-admin-badge ${account.status === "active" ? "rp-admin-success" : "rp-admin-warning"}`}>{account.status === "active" ? "Activa" : account.status === "suspended" ? "Suspendida" : account.status}</span></td>
            <td><span className={`rp-admin-badge ${account.apiPaused ? "rp-admin-warning" : "rp-admin-success"}`}>{account.apiPaused ? "Pausada" : "Sin pausa"}</span>
              {account.status !== "active" && <span className="rp-admin-detail">Acceso sujeto al estado de la cuenta</span>}</td>
            <td><span className={`rp-admin-badge ${account.enrollmentApproved ? "rp-admin-success" : "rp-admin-warning"}`}>{account.enrollmentApproved ? "Acceso aprobado" : "Aprobación pendiente"}</span>
              <span className="rp-admin-detail">{account.totpEnabled ? "2FA configurado" : "2FA sin configurar"}</span>
              <span className="rp-admin-detail">Sesiones: {account.sessionCount}</span><span className="rp-admin-detail">Último acceso: {displayDate(account.lastLoginAt)}</span></td>
            <td><div className="rp-admin-row-actions">
              {!account.enrollmentApproved && <>
                <Button size="sm" disabled={actionBusy || accountsLoading || Boolean(accountsError) || !account.telegramChatId?.trim()}
                  onClick={() => openAction(account, "approve-access")} aria-label={`Aprobar acceso de ${account.username}`}
                  aria-describedby={!account.telegramChatId?.trim() ? `rp-telegram-required-${account.id}` : undefined}>Aprobar acceso</Button>
                {!account.telegramChatId?.trim() && <span id={`rp-telegram-required-${account.id}`} className="rp-admin-detail">El revendedor debe vincular Telegram primero.</span>}
              </>}
              <Button size="sm" variant="outline" disabled={actionBusy || accountsLoading || Boolean(accountsError)} onClick={() => openAction(account, "revoke")} aria-label={`Cerrar sesiones web de ${account.username}`}><LogOut aria-hidden="true" />Cerrar sesiones</Button>
              <Button size="sm" variant="outline" disabled={actionBusy || accountsLoading || Boolean(accountsError)} onClick={() => openAction(account, "reset-otp")} aria-label={`Restablecer 2FA de ${account.username}`}>Restablecer 2FA</Button>
              <Button size="sm" variant="outline" disabled={actionBusy || accountsLoading || Boolean(accountsError)} onClick={() => openAction(account, "reset-password")} aria-label={`Restablecer contraseña de ${account.username}`}>Restablecer contraseña</Button>
              <Button size="sm" variant="outline" disabled={actionBusy || accountsLoading || Boolean(accountsError)} onClick={() => openAction(account, "api-pause")} aria-label={`${account.apiPaused ? "Reanudar" : "Pausar"} API de ${account.username}`}>{account.apiPaused ? "Reanudar API" : "Pausar API"}</Button>
            </div></td>
          </tr>)}</tbody>
        </table>
      </div>
      {!accountsLoading && !accountsError && filteredAccounts.length === 0 && <p className="rp-admin-empty">{accounts.length ? "No hay cuentas que coincidan con la búsqueda." : "Aún no hay cuentas de revendedores."}</p>}
    </section>

    <PortalDialog open={Boolean(action)} onClose={closeAction} title={actionLabel} description={actionDescription} busy={actionBusy}>
      <form onSubmit={performAction} className="rp-admin-dialog-form">
        {action?.kind === "approve-access" && <dl className="rp-admin-receipt">
          <div><dt>Usuario</dt><dd>{action.account.username}</dd></div>
          <div><dt>Telegram ID</dt><dd className="rp-admin-identifier">{action.account.telegramChatId?.trim() || "Sin vincular"}</dd></div>
        </dl>}
        {action?.kind !== "revoke" && <label htmlFor="rp-admin-otp">Tu código 2FA de administrador
          <Input id="rp-admin-otp" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6}
            value={code} disabled={actionBusy} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} aria-describedby="rp-admin-otp-help" />
          <span id="rp-admin-otp-help" className="rp-admin-hint">Usa el código de tu propia app de autenticación.</span></label>}
        {actionError && <p className="rp-admin-error" role="alert">{actionError}</p>}
        <div className="rp-admin-actions">
          <Button data-initial-focus type="button" variant="outline" onClick={closeAction} disabled={actionBusy}>Cancelar</Button>
          <Button type="submit" variant={action?.kind === "approve-access" || (action?.kind === "api-pause" && action.account.apiPaused) ? "default" : "destructive"}
            disabled={actionBusy || (action?.kind === "approve-access" && !action.account.telegramChatId?.trim())}>
            {actionBusy && <LoaderCircle className="animate-spin" aria-hidden="true" />}{actionBusy ? "Confirmando…" : actionLabel}
          </Button>
        </div>
      </form>
    </PortalDialog>
  </div>;
}

// Pending intents survive dismissal, navigation between admin tabs and a page reload.
// The server owns idempotency and returns the same receipt when an intent is retried.
export function ResellerTopUp({ reseller, onClose, onComplete, onSessionExpired }: {
  reseller: ResellerIdentity | null; onClose: () => void; onComplete: () => Promise<void>; onSessionExpired: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [intent, setIntent] = useState<TopUpIntent | null>(null);
  const pendingIntents = useRef(new Map<string, TopUpIntent>());
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const receiptStatus = useRef<HTMLParagraphElement>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const storageKey = (resellerId: string) => `arepa_admin_topup:${loadSession()?.user.userId}:${resellerId}`;

  useEffect(() => {
    if (!reseller) return;
    let pending = pendingIntents.current.get(reseller.id) || null;
    if (!pending) {
      try {
        const stored = JSON.parse(sessionStorage.getItem(storageKey(reseller.id)) || "null") as TopUpIntent | null;
        if (stored?.resellerId === reseller.id && typeof stored.idempotencyKey === "string" &&
            Number.isFinite(stored.amount) && stored.amount > 0 && typeof stored.description === "string") pending = stored;
      } catch { /* The in-memory intent remains available if storage is unavailable. */ }
    }
    setIntent(pending); setAmount(pending ? String(pending.amount) : ""); setReceipt(null); setError(""); setCopied(false);
  }, [reseller]);

  useEffect(() => { if (receipt) receiptStatus.current?.focus(); }, [receipt]);

  const changeAmount = (nextAmount: string) => {
    if (!reseller || busyRef.current) return;
    if (intent && Number(nextAmount) !== intent.amount) {
      if (!window.confirm("Cambiar el monto iniciará una nueva recarga. La anterior podría haberse aplicado aunque no se recibiera su comprobante. Reintenta su confirmación para comprobarlo antes de cambiarla. ¿Iniciar una nueva recarga?")) return;
      try { sessionStorage.removeItem(storageKey(reseller.id)); }
      catch { setError("No se pudo actualizar la referencia guardada. Reintenta confirmar la recarga pendiente."); return; }
      pendingIntents.current.delete(reseller.id); setIntent(null);
    }
    setAmount(nextAmount); setError("");
  };

  const topUp = async (event: FormEvent) => {
    event.preventDefault();
    if (!reseller || busyRef.current || receipt) return;
    const value = Number(amount);
    if (!intent && (!/^\d+(?:\.\d{1,2})?$/.test(amount.trim()) || !Number.isFinite(value) || value <= 0 || value > 1000000)) {
      setError("Indica un monto mayor que cero y de hasta 1 000 000 USD, con hasta dos decimales."); return;
    }
    busyRef.current = true; setBusy(true); setError("");
    try {
      const pending = intent || { resellerId: reseller.id, amount: value, description: "Recarga administrativa", idempotencyKey: crypto.randomUUID() };
      // Store before sending, and retain both the payload and key after any uncertain result.
      pendingIntents.current.set(reseller.id, pending); setIntent(pending);
      try { sessionStorage.setItem(storageKey(reseller.id), JSON.stringify(pending)); }
      catch { throw new Error("No se pudo guardar la referencia de recarga en este navegador. Habilita el almacenamiento y reintenta; no se envió la recarga."); }
      const data = await adminRequest("resellers/add-balance", pending, onSessionExpired);
      if (!data.receipt?.id) throw new Error("La respuesta no incluye un comprobante. Reintenta confirmar esta misma recarga.");
      setReceipt(data.receipt as Receipt); setIntent(null); pendingIntents.current.delete(reseller.id);
      try { sessionStorage.removeItem(storageKey(reseller.id)); } catch { /* A saved key is safe to retry. */ }
      try { await onComplete(); }
      catch { setError("Recarga confirmada. No se pudo actualizar el saldo mostrado en la lista; usa Actualizar."); }
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo confirmar la recarga. Reintenta con el mismo monto; se conservará la referencia de esta operación."));
    } finally { busyRef.current = false; setBusy(false); }
  };

  const copyReceipt = async () => {
    if (!receipt || !reseller) return;
    try {
      await navigator.clipboard.writeText([
        "ArepaTool · Comprobante de recarga", `Comprobante: ${receipt.id}`,
        `Revendedor: ${reseller.name} (${reseller.username})`, `ID revendedor: ${reseller.id}`,
        `Monto: ${displayMoney(receipt.amount)}`, `Saldo anterior: ${displayMoney(receipt.balanceBefore)}`,
        `Saldo posterior: ${displayMoney(receipt.balanceAfter)}`, `Fecha: ${displayDate(receipt.createdAt)}`,
        `Descripción: ${receipt.description}`,
      ].join("\n"));
      setCopied(true);
    } catch { setCopied(false); setError("No se pudo copiar. Puedes seleccionar y copiar los datos del comprobante."); }
  };

  return <PortalDialog open={Boolean(reseller)} onClose={onClose} busy={busy}
    title={receipt ? "Recarga confirmada" : "Recargar saldo"}
    description={reseller ? `${reseller.name || reseller.username} · ${reseller.username}` : "Recarga administrativa"}>
    {receipt ? <>
      <p ref={receiptStatus} tabIndex={-1} className="rp-admin-success" role="status">El servidor confirmó esta recarga.</p>
      <dl className="rp-admin-receipt">
        <div><dt>Comprobante</dt><dd className="rp-admin-identifier">{receipt.id}</dd></div>
        <div><dt>Monto</dt><dd>{displayMoney(receipt.amount)}</dd></div>
        <div><dt>Saldo anterior</dt><dd>{displayMoney(receipt.balanceBefore)}</dd></div>
        <div><dt>Saldo posterior</dt><dd>{displayMoney(receipt.balanceAfter)}</dd></div>
        <div><dt>Fecha</dt><dd>{displayDate(receipt.createdAt)}</dd></div>
        <div><dt>Descripción</dt><dd>{receipt.description}</dd></div>
      </dl>
      <div className="rp-admin-actions">
        <Button onClick={() => void copyReceipt()}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copiado" : "Copiar comprobante"}</Button>
        <Button data-initial-focus variant="outline" onClick={onClose} disabled={busy}>Cerrar</Button>
      </div>
      {copied && <p className="sr-only" role="status">Comprobante copiado.</p>}
    </> : <form onSubmit={topUp} className="rp-admin-dialog-form">
      <label htmlFor="rp-topup-amount">Monto de la recarga (USD)
        <Input id="rp-topup-amount" required type="text" inputMode="decimal" value={amount} disabled={busy}
          onChange={event => changeAmount(event.target.value)} aria-describedby="rp-topup-help" /></label>
      <p id="rp-topup-help" className="rp-admin-hint">{intent
        ? "Esta recarga está pendiente de confirmación. Reintentar conserva el monto y la referencia para evitar duplicarla. Puedes cerrar y retomarla desde este revendedor."
        : "Confirma el monto para añadir saldo al revendedor. Al completarse, recibirás un comprobante."}</p>
      <div className="rp-admin-actions">
        <Button data-initial-focus type="button" variant="outline" onClick={onClose} disabled={busy}>{intent ? "Cerrar" : "Cancelar"}</Button>
        <Button type="submit" disabled={busy}>{busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}{busy ? "Confirmando…" : intent ? "Reintentar confirmación" : "Confirmar recarga"}</Button>
      </div>
    </form>}
    {error && <p className="rp-admin-error" role="alert">{error}</p>}
  </PortalDialog>;
}
