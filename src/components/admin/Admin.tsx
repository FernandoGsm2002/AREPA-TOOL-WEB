import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Box, Users, KeyRound, RefreshCw, LogOut, Search, ShieldAlert, ShieldCheck, Upload, Copy, Check, Eye, EyeOff, ExternalLink, Pencil, Trash2, X, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearSession, loadSession, webApiFetch } from "@/lib/web-session";
import AdminLogin from "./AdminLogin";
import TotpSecurity from "./TotpSecurity";

type Tab = "users" | "rentals" | "task" | "mtk" | "apks" | "version" | "resellers" | "security";
const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Usuarios", icon: Users }, { id: "task", label: "Task IDs", icon: Search },
  { id: "rentals", label: "Licencias de alquiler", icon: KeyRound },
  { id: "mtk", label: "MTK no soportados", icon: AlertTriangle },
  { id: "apks", label: "APK Catalog", icon: Box }, { id: "version", label: "Actualización", icon: Upload },
  { id: "resellers", label: "Revendedores", icon: KeyRound },
  { id: "security", label: "Seguridad", icon: ShieldCheck },
];

const date = (value?: string | null) => value ? new Date(value).toLocaleString("es-PE") : "—";
const money = (value?: string | number) => `$${Number(value || 0).toFixed(2)}`;
type ApkDraft = { id?: string; name: string; version: string; packageName: string; category: string; description: string; isActive: boolean; apkFile: string; file: File | null };
type ResellerDraft = { id: string; username: string; name: string; email: string; status: string; price3m: string; price6m: string; price12m: string; telegramChatId: string };
const emptyApkDraft = (): ApkDraft => ({ name: "", version: "", packageName: "", category: "general", description: "", isActive: true, apkFile: "", file: null });
// El software Dhru agrega /api/index.php automáticamente a este dominio.
const DHRU_API_URL = "https://dhru.arepatool.com";

export default function Admin() {
  const [tab, setTab] = useState<Tab>("users");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState(""); const [userFilter, setUserFilter] = useState("all"); const [page, setPage] = useState(0); const [totalUsers, setTotalUsers] = useState(0);
  const [task, setTask] = useState(""); const [operation, setOperation] = useState<any>(undefined);
  const [apks, setApks] = useState<any[]>([]); const [resellers, setResellers] = useState<any[]>([]);
  const [unsupportedMtk, setUnsupportedMtk] = useState<any[]>([]);
  const [version, setVersion] = useState<any>(null); const [notice, setNotice] = useState("");
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null); const [copied, setCopied] = useState("");
  const [apkDraft, setApkDraft] = useState<ApkDraft | null>(null); const [apkBusy, setApkBusy] = useState(false);
  const [resellerDraft, setResellerDraft] = useState<ResellerDraft | null>(null); const [resellerBusy, setResellerBusy] = useState(false);
  const [rentalCount, setRentalCount] = useState("1"); const [rentalPrefix, setRentalPrefix] = useState("arepatoolrent"); const [rentalBusy, setRentalBusy] = useState(false); const [rentalAccounts, setRentalAccounts] = useState<Array<{username:string;email:string;password:string}>>([]);

  const call = async (path: string, body: Record<string, unknown> = {}) => {
    const data = await webApiFetch(`/api/admin/${path}`, body);
    if (!data) { setNeedsLogin(true); setAllowed(null); return null; }
    if (!data.success) { setNotice(data.error || "No se pudo completar la acción."); return null; }
    return data;
  };
  const loadUsers = async (nextPage = page) => { const d = await call("users/list", { search, status:userFilter === "all" ? "" : userFilter, limit:30, offset:nextPage * 30 }); if (d) { setUsers(d.users); setTotalUsers(d.total); setPage(nextPage); } };
  const loadTab = async (next: Tab = tab) => {
    if (next === "users") await loadUsers();
    if (next === "apks") { const d = await call("apks/list"); if (d) setApks(d.apks); }
    if (next === "resellers") { const d = await call("resellers/list"); if (d) setResellers(d.resellers); }
    if (next === "mtk") { const d = await call("mtk/unsupported/list"); if (d) setUnsupportedMtk(d.devices); }
    if (next === "version") { const d = await call("app-version/get"); if (d) setVersion(d.version); }
  };
  useEffect(() => {
    const session = loadSession();
    if (!session) { setNeedsLogin(true); return; }
    if (session.user.status !== "admin") { setAllowed(false); return; }
    setAllowed(true); loadTab("users");
  }, []);
  const onLoginSuccess = () => { setNeedsLogin(false); setAllowed(true); loadTab("users"); };
  const choose = (next: Tab) => { setTab(next); setNotice(""); loadTab(next); };
  const resetSession = async (id: string) => { if (confirm("¿Liberar la sesión y HWID de este usuario?")) { await call("users/reset-session", { userId:id }); loadUsers(); } };
  const suspend = async (id: string, current: string) => { const status = current === "suspended" ? "active" : "suspended"; if (confirm(`¿Cambiar estado a ${status}?`)) { await call("users/update", {userId:id,status}); loadUsers(); } };
  const removeUser = async (id:string, username:string) => { if (confirm(`Eliminar definitivamente a ${username}?`)) { await call("users/delete", {userId:id}); loadUsers(); } };
  const searchTask = async (e: React.FormEvent) => { e.preventDefault(); setOperation(undefined); const d = await call("operations/find", { taskId:task }); if (d) setOperation(d.operation); };
  const editApk = (apk?: any) => setApkDraft(apk ? { id: apk.id, name: apk.name || "", version: apk.version || "", packageName: apk.package_name || "", category: apk.category || "general", description: apk.description || "", isActive: apk.is_active !== false, apkFile: apk.apk_file || "", file: null } : emptyApkDraft());
  const saveApk = async (e: React.FormEvent) => {
    e.preventDefault(); if (!apkDraft || apkBusy) return;
    if (!apkDraft.name.trim() || !apkDraft.version.trim() || (!apkDraft.file && !apkDraft.apkFile)) { setNotice("Indica nombre, versión y selecciona un APK."); return; }
    setApkBusy(true); setNotice("");
    try {
      let uploadedKey: string | undefined;
      if (apkDraft.file) {
        const type = apkDraft.file.type || "application/vnd.android.package-archive";
        const signed = await call("apks/upload-url", { filename: apkDraft.file.name, contentType: type, sizeBytes: apkDraft.file.size });
        if (!signed) return;
        const upload = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": signed.contentType }, body: apkDraft.file });
        if (!upload.ok) throw new Error(`R2 respondió ${upload.status} al cargar el APK.`);
        uploadedKey = signed.key;
      }
      const saved = await call("apks/save", { id: apkDraft.id, name: apkDraft.name.trim(), version: apkDraft.version.trim(), packageName: apkDraft.packageName.trim(), category: apkDraft.category, description: apkDraft.description.trim(), isActive: apkDraft.isActive, apkFile: apkDraft.apkFile, uploadedKey });
      if (!saved) return;
      setApkDraft(null); await loadTab("apks"); setNotice("APK guardado y disponible para APK Installer.");
    } catch (err) { setNotice(err instanceof Error ? err.message : "No se pudo cargar el APK a R2."); }
    finally { setApkBusy(false); }
  };
  const deleteApk = async (apk: any) => { if (!confirm(`¿Eliminar “${apk.name}” del catálogo y de R2? Esta acción no se puede deshacer.`)) return; const done = await call("apks/delete", { id: apk.id }); if (done) { await loadTab("apks"); setNotice("APK eliminado del catálogo y R2."); } };
  const credit = async (id:string) => { const amount=prompt("Monto a recargar:"); if (!amount) return; await call("resellers/add-balance", {resellerId:id,amount:Number(amount),description:"Recarga administrativa"}); loadTab("resellers"); };
  const editReseller = (r:any) => setResellerDraft({ id:r.id, username:r.username||"", name:r.name||"", email:r.email||"", status:r.status||"active", price3m:String(r.service_price_3m??""), price6m:String(r.service_price_6m??""), price12m:String(r.service_price??""), telegramChatId:r.telegram_chat_id||"" });
  const saveReseller = async (e:React.FormEvent) => { e.preventDefault(); if (!resellerDraft || resellerBusy) return; setResellerBusy(true); setNotice(""); try { const saved=await call("resellers/save", resellerDraft); if (!saved) return; setResellerDraft(null); await loadTab("resellers"); setNotice("Precios y datos del revendedor guardados. Dhru los aplicará en la siguiente consulta."); } finally { setResellerBusy(false); } };
  const copyDhruValue = async (id: string, value: string, label: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(`${id}:${label}`); setTimeout(() => setCopied(""), 1800); }
    catch { setNotice("No se pudo copiar. Revisa los permisos del navegador."); }
  };
  const saveVersion = async (e:React.FormEvent) => { e.preventDefault(); const form=new FormData(e.currentTarget as HTMLFormElement); await call("app-version/save", {latestVersion:form.get("latestVersion"),minVersion:form.get("minVersion"),downloadUrl:form.get("downloadUrl")}); loadTab("version"); setNotice("Actualización guardada."); };
  const generateRentals = async (e: React.FormEvent) => {
    e.preventDefault(); if (rentalBusy) return;
    const count = Number(rentalCount);
    if (!Number.isInteger(count) || count < 1 || count > 50) { setNotice("La cantidad debe estar entre 1 y 50."); return; }
    setRentalBusy(true); setNotice(""); setRentalAccounts([]);
    try {
      const generated = await call("rentals/generate", { count, prefix: rentalPrefix });
      if (!generated) return;
      setRentalAccounts(generated.accounts || []);
      setNotice(`${generated.accounts?.length || 0} licencias creadas. Las 12 horas empiezan con su primer inicio de sesión.`);
    } finally { setRentalBusy(false); }
  };
  const copyRentalAccounts = async () => {
    const content = rentalAccounts.map((account) => `Usuario: ${account.username}\nCorreo: ${account.email}\nContraseña: ${account.password}\nDuración: 12 horas desde el primer inicio de sesión`).join("\n\n");
    try { await navigator.clipboard.writeText(content); setCopied("rentals"); setTimeout(() => setCopied(""), 1800); }
    catch { setNotice("No se pudo copiar las credenciales. Revisa los permisos del navegador."); }
  };
  if (needsLogin) return <AdminLogin onSuccess={onLoginSuccess} />;
  if (allowed === null) return <div className="flex min-h-screen items-center justify-center text-muted-foreground"><RefreshCw className="mr-2 size-4 animate-spin"/>Comprobando acceso…</div>;
  if (!allowed) return <div className="flex min-h-screen items-center justify-center p-6"><div className="border-destructive/30 bg-card max-w-md rounded-2xl border p-7 text-center"><ShieldAlert className="text-destructive mx-auto size-8"/><h1 className="font-display mt-4 text-xl font-bold">Acceso restringido</h1><p className="text-muted-foreground mt-2 text-sm">Esta cuenta no tiene permisos administrativos.</p><a href="/dashboard" className="text-primary mt-5 inline-block text-sm">Volver al panel</a></div></div>;
  return <div className="bg-background min-h-screen lg:flex">
    <aside className="border-border/70 bg-card/70 flex shrink-0 flex-col border-b p-4 lg:w-68 lg:border-r lg:border-b-0">
      <a href="/" className="mb-6 block rounded-xl border border-white/8 bg-white/[.03] px-3 py-1"><img src="/pngs/arepalanding.png" alt="ArepaTool" className="-my-7 h-21 w-full object-contain"/></a>
      <p className="text-muted-foreground mb-2 px-3 text-[10px] font-bold tracking-[.16em] uppercase">Administración</p>
      <nav className="grid gap-1 sm:grid-cols-2 lg:block">{tabs.map(({id,label,icon:Icon}) => <button key={id} onClick={()=>choose(id)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${tab===id?"bg-primary text-primary-foreground shadow-lg shadow-primary/20":"text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="size-4"/>{label}</button>)}</nav>
      <div className="mt-auto hidden border-t pt-4 lg:block"><p className="text-muted-foreground px-2 text-xs">Sesión: {loadSession()?.user.username}</p><Button variant="ghost" className="mt-1 w-full justify-start" onClick={()=>{clearSession();setAllowed(null);setNeedsLogin(true)}}><LogOut/>Cerrar sesión</Button></div>
    </aside>
    <main className="min-w-0 flex-1 p-5 sm:p-9"><header className="mb-7 flex items-start justify-between gap-4"><div><p className="text-primary text-xs font-bold tracking-[.14em] uppercase">Control operativo</p><h1 className="font-display mt-1 text-3xl font-bold tracking-tight">{tabs.find(x=>x.id===tab)?.label}</h1></div><Button variant="outline" size="sm" onClick={()=>loadTab()}><RefreshCw className="size-4"/>Actualizar</Button></header>{notice&&<p className="border-destructive/25 bg-destructive/8 text-destructive mb-5 rounded-lg border px-3 py-2 text-sm">{notice}</p>}
      {tab==="users" && <section><form className="mb-4 flex gap-2" onSubmit={e=>{e.preventDefault();loadUsers(0)}}><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar usuario o email"/><Button>Buscar</Button></form><div className="mb-4 flex flex-wrap gap-2">{["all","active","pending","suspended"].map(status=><Button key={status} size="sm" variant={userFilter===status?"default":"outline"} onClick={()=>{setUserFilter(status); loadUsers(0)}}>{status==="all"?"Todos":status==="active"?"Activos":status==="pending"?"Pendientes":"Suspendidos"}</Button>)}</div><div className="border-border/60 overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-muted/50 text-xs"><tr><th className="p-3">Usuario</th><th className="p-3">Estado</th><th className="p-3">Vence</th><th className="p-3"></th></tr></thead><tbody>{users.map(u=><tr key={u.id} className="border-border/50 border-t"><td className="p-3"><b>{u.username}</b><span className="text-muted-foreground block text-xs">{u.email}</span></td><td className="p-3">{u.status}</td><td className="p-3 text-xs">{date(u.subscription_end)}</td><td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={()=>suspend(u.id,u.status)}>{u.status==="suspended"?"Activar":"Suspender"}</Button>{u.status!=="admin"&&<Button size="sm" variant="ghost" className="text-destructive" onClick={()=>removeUser(u.id,u.username)}>Eliminar</Button>}</td></tr>)}</tbody></table></div><div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted-foreground">{totalUsers} usuarios · Página {page+1} de {Math.max(1,Math.ceil(totalUsers/30))}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page===0} onClick={()=>loadUsers(page-1)}>Anterior</Button><Button size="sm" variant="outline" disabled={(page+1)*30>=totalUsers} onClick={()=>loadUsers(page+1)}>Siguiente</Button></div></div></section>}
      {tab==="rentals" && <section className="max-w-4xl"><div className="border-primary/25 bg-primary/5 rounded-xl border p-5"><h2 className="font-display text-lg font-semibold">Generar licencias de 12 horas</h2><p className="text-muted-foreground mt-1 text-sm">Cada cuenta se activa al iniciar sesión por primera vez. Antes de eso no vence; después del primer acceso, expira exactamente 12 horas más tarde.</p><form onSubmit={generateRentals} className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto]"><label className="grid gap-1.5 text-sm">Prefijo de usuario<Input value={rentalPrefix} onChange={e=>setRentalPrefix(e.target.value.toLowerCase())} maxLength={60} placeholder="arepatoolrent"/></label><label className="grid gap-1.5 text-sm">Cantidad<Input type="number" min="1" max="50" value={rentalCount} onChange={e=>setRentalCount(e.target.value)}/></label><Button className="self-end" disabled={rentalBusy}>{rentalBusy?<LoaderCircle className="animate-spin"/>:<KeyRound/>}{rentalBusy?"Generando…":"Generar"}</Button></form></div>{rentalAccounts.length>0&&<div className="border-border/60 bg-card mt-5 rounded-xl border"><div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h3 className="font-semibold">Credenciales recién creadas</h3><p className="text-muted-foreground mt-1 text-xs">Guárdalas ahora: las contraseñas no se vuelven a mostrar.</p></div><Button size="sm" variant="outline" onClick={copyRentalAccounts}>{copied==="rentals"?<Check/>:<Copy/>}{copied==="rentals"?"Copiado":"Copiar todo"}</Button></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/50 text-xs"><tr><th className="p-3">Usuario</th><th className="p-3">Correo</th><th className="p-3">Contraseña</th></tr></thead><tbody>{rentalAccounts.map(account=><tr key={account.username} className="border-border/50 border-t"><td className="p-3 font-mono">{account.username}</td><td className="p-3 font-mono text-xs">{account.email}</td><td className="p-3 font-mono">{account.password}</td></tr>)}</tbody></table></div></div>}</section>}
      {tab==="task" && <section className="max-w-3xl"><p className="text-muted-foreground mb-4 text-sm">Consulta el registro estructurado enviado por la herramienta Windows.</p><form onSubmit={searchTask} className="flex gap-2"><Input value={task} onChange={e=>setTask(e.target.value.toUpperCase())} placeholder="AT-XXXXXX"/><Button>Buscar Task ID</Button></form>{operation===null&&<p className="text-muted-foreground mt-5 text-sm">No existe una operación con ese Task ID.</p>}{operation&&<pre className="border-border/60 bg-card mt-5 overflow-auto rounded-xl border p-5 text-xs">{JSON.stringify(operation,null,2)}</pre>}</section>}
      {tab==="mtk" && <section><p className="text-muted-foreground mb-4 text-sm">Equipos reportados desde Read Info cuyo XT y Android no tienen una variante LK publicada.</p><div className="border-border/60 overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-muted/50 text-xs"><tr><th className="p-3">Modelo</th><th className="p-3">Android</th><th className="p-3">IMEI</th><th className="p-3">Usuario</th><th className="p-3">Último reporte</th><th className="p-3">Vistos</th></tr></thead><tbody>{unsupportedMtk.map(d=><tr key={d.id} className="border-border/50 border-t"><td className="p-3"><b>{d.sku||"—"}</b><span className="text-muted-foreground block text-xs">{d.codename||"—"} · {d.cpu||"—"}</span></td><td className="p-3">{d.android_version||"No detectado"}</td><td className="p-3 font-mono text-xs">{d.imei||"—"}</td><td className="p-3 text-xs">{d.username||"—"}<span className="text-muted-foreground block">{d.email||""}</span></td><td className="p-3 text-xs">{date(d.last_seen)}</td><td className="p-3">{d.report_count}</td></tr>)}{unsupportedMtk.length===0&&<tr><td className="text-muted-foreground p-6 text-center" colSpan={6}>Aún no hay reportes.</td></tr>}</tbody></table></div></section>}
      {tab==="apks" && <section><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-muted-foreground text-sm">Carga .apk, .apks o .xapk directamente en R2. Al reemplazarlo o eliminarlo, el archivo anterior también se borra.</p><Button onClick={()=>editApk()}><Upload/>Subir paquete</Button></div>{apkDraft&&<form onSubmit={saveApk} className="border-primary/30 bg-card mb-6 grid gap-4 rounded-xl border p-5 shadow-lg shadow-primary/5 md:grid-cols-2"><div className="md:col-span-2 flex items-center justify-between"><div><h2 className="font-display font-semibold">{apkDraft.id?"Editar APK":"Nuevo APK"}</h2><p className="text-muted-foreground mt-1 text-xs">{apkDraft.id?"Selecciona un archivo nuevo sólo si deseas reemplazarlo.":"El archivo se carga a R2 y luego se registra en el catálogo."}</p></div><Button type="button" variant="ghost" size="icon" onClick={()=>setApkDraft(null)} aria-label="Cerrar"><X/></Button></div><label className="grid gap-1.5 text-sm">Nombre<Input required value={apkDraft.name} onChange={e=>setApkDraft({...apkDraft,name:e.target.value})} placeholder="Magisk"/></label><label className="grid gap-1.5 text-sm">Versión<Input required value={apkDraft.version} onChange={e=>setApkDraft({...apkDraft,version:e.target.value})} placeholder="29.0"/></label><label className="grid gap-1.5 text-sm md:col-span-2">Archivo (.apk, .apks o .xapk)<Input type="file" accept=".apk,.apks,.xapk,application/vnd.android.package-archive" required={!apkDraft.apkFile} onChange={e=>setApkDraft({...apkDraft,file:e.target.files?.[0]||null})}/>{apkDraft.apkFile&&<span className="text-muted-foreground truncate font-mono text-xs">Actual: {apkDraft.apkFile}</span>}</label><label className="grid gap-1.5 text-sm">Package name<Input value={apkDraft.packageName} onChange={e=>setApkDraft({...apkDraft,packageName:e.target.value})} placeholder="com.example.app"/></label><label className="grid gap-1.5 text-sm">Categoría<select className="border-input bg-background h-10 rounded-md border px-3 text-sm" value={apkDraft.category} onChange={e=>setApkDraft({...apkDraft,category:e.target.value})}><option value="general">General</option><option value="root">Root</option><option value="banking">Banking</option><option value="tools">Tools</option><option value="system">System</option></select></label><label className="grid gap-1.5 text-sm md:col-span-2">Descripción<Input value={apkDraft.description} onChange={e=>setApkDraft({...apkDraft,description:e.target.value})} placeholder="Descripción opcional"/></label><label className="text-muted-foreground flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={apkDraft.isActive} onChange={e=>setApkDraft({...apkDraft,isActive:e.target.checked})}/>Visible para los usuarios</label><div className="flex gap-2 md:col-span-2"><Button disabled={apkBusy}>{apkBusy?<LoaderCircle className="animate-spin"/>:<Upload/>}{apkBusy?"Cargando a R2…":"Guardar APK"}</Button><Button type="button" variant="outline" disabled={apkBusy} onClick={()=>setApkDraft(null)}>Cancelar</Button></div></form>}<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{apks.map(a=><article key={a.id} className="border-border/60 bg-card rounded-xl border p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="font-semibold">{a.name}</p><p className="text-muted-foreground mt-1 text-xs">{a.version} · {a.category}</p></div><span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs">{a.is_active?"Activo":"Inactivo"}</span></div><p className="text-muted-foreground mt-3 truncate font-mono text-xs" title={a.apk_file}>{a.apk_file}</p><p className="text-muted-foreground mt-1 text-xs">{a.size_mb ? `${Number(a.size_mb).toFixed(2)} MB` : "Tamaño no registrado"}</p><div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={()=>editApk(a)}><Pencil/>Editar</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={()=>deleteApk(a)}><Trash2/>Eliminar</Button></div></article>)}{apks.length===0&&<p className="text-muted-foreground col-span-full rounded-xl border border-dashed p-8 text-center text-sm">Aún no hay APKs en el catálogo.</p>}</div></section>}
      {tab==="version" && version&&<form onSubmit={saveVersion} className="border-border/60 bg-card max-w-2xl space-y-4 rounded-xl border p-5"><label className="block text-sm">Última versión<Input name="latestVersion" defaultValue={version.latest_version}/></label><label className="block text-sm">Mínima obligatoria<Input name="minVersion" defaultValue={version.min_version||""}/></label><label className="block text-sm">Enlace de descarga<Input name="downloadUrl" defaultValue={version.download_url}/></label><Button>Guardar actualización</Button></form>}
      {tab==="resellers" && <section>{resellerDraft&&<form onSubmit={saveReseller} className="border-primary/30 bg-card mb-6 grid gap-4 rounded-xl border p-5 shadow-lg shadow-primary/5 md:grid-cols-2"><div className="md:col-span-2 flex items-start justify-between gap-4"><div><h2 className="font-display font-semibold">Configurar revendedor</h2><p className="text-muted-foreground mt-1 text-xs">Estos precios son los créditos que verá y pagará este revendedor en Dhru.</p></div><Button type="button" variant="ghost" size="icon" onClick={()=>setResellerDraft(null)} aria-label="Cerrar"><X/></Button></div><label className="grid gap-1.5 text-sm">Nombre<Input required value={resellerDraft.name} onChange={e=>setResellerDraft({...resellerDraft,name:e.target.value})}/></label><label className="grid gap-1.5 text-sm">Usuario<Input required value={resellerDraft.username} onChange={e=>setResellerDraft({...resellerDraft,username:e.target.value.toLowerCase()})}/></label><label className="grid gap-1.5 text-sm">Precio 3 meses (USD)<Input required type="number" min="0" step="0.01" value={resellerDraft.price3m} onChange={e=>setResellerDraft({...resellerDraft,price3m:e.target.value})}/></label><label className="grid gap-1.5 text-sm">Precio 6 meses (USD)<Input required type="number" min="0" step="0.01" value={resellerDraft.price6m} onChange={e=>setResellerDraft({...resellerDraft,price6m:e.target.value})}/></label><label className="grid gap-1.5 text-sm">Precio 12 meses (USD)<Input required type="number" min="0" step="0.01" value={resellerDraft.price12m} onChange={e=>setResellerDraft({...resellerDraft,price12m:e.target.value})}/></label><label className="grid gap-1.5 text-sm">Estado<select className="border-input bg-background h-10 rounded-md border px-3 text-sm" value={resellerDraft.status} onChange={e=>setResellerDraft({...resellerDraft,status:e.target.value})}><option value="active">Activo</option><option value="suspended">Suspendido</option></select></label><label className="grid gap-1.5 text-sm md:col-span-2">Correo<Input type="email" value={resellerDraft.email} onChange={e=>setResellerDraft({...resellerDraft,email:e.target.value})}/></label><label className="grid gap-1.5 text-sm md:col-span-2">Chat ID Telegram (opcional)<Input value={resellerDraft.telegramChatId} onChange={e=>setResellerDraft({...resellerDraft,telegramChatId:e.target.value})}/></label><div className="flex gap-2 md:col-span-2"><Button disabled={resellerBusy}>{resellerBusy?<LoaderCircle className="animate-spin"/>:<Check/>}{resellerBusy?"Guardando…":"Guardar precios"}</Button><Button type="button" variant="outline" disabled={resellerBusy} onClick={()=>setResellerDraft(null)}>Cancelar</Button></div></form>}<div className="grid gap-4 xl:grid-cols-2">{resellers.map(r=>{
        const keyVisible = visibleKeyId === r.id;
        const keyText = String(r.api_key || "");
        const maskedKey = keyText ? `${keyText.slice(0, 7)}${"•".repeat(Math.max(16, keyText.length - 14))}${keyText.slice(-7)}` : "Sin clave asignada";
        const isCopied = (label:string) => copied === `${r.id}:${label}`;
        return <article key={r.id} className="border-border/60 bg-card overflow-hidden rounded-xl border">
          <div className="flex justify-between gap-3 p-5"><div><p className="font-semibold">{r.name}</p><p className="text-muted-foreground text-xs">{r.username} · {r.status}</p></div><p className="font-mono text-lg">{money(r.balance)}</p></div>
          <div className="border-border/55 bg-muted/25 border-y px-5 py-3 text-xs text-muted-foreground">3m {money(r.service_price_3m)} · 6m {money(r.service_price_6m)} · 12m {money(r.service_price)}</div>
          <div className="p-5"><div className="mb-3 flex items-center justify-between"><div><p className="text-primary text-[10px] font-bold tracking-[.14em] uppercase">Conexión Dhru</p><p className="text-muted-foreground mt-1 text-xs">Copia estos valores en el panel del revendedor.</p></div><ExternalLink className="text-primary/70 size-4"/></div>
            <div className="border-border/60 bg-background/70 divide-border/50 overflow-hidden rounded-lg border divide-y font-mono text-xs">
              <div className="flex items-center gap-2 px-3 py-2.5"><span className="text-muted-foreground w-15 shrink-0 font-sans text-[10px] font-bold tracking-wide uppercase">URL</span><span className="min-w-0 flex-1 truncate">{DHRU_API_URL}</span><Button aria-label="Copiar URL Dhru" size="icon-xs" variant="ghost" onClick={()=>copyDhruValue(r.id,DHRU_API_URL,"url")}>{isCopied("url")?<Check/>:<Copy/>}</Button></div>
              <div className="flex items-center gap-2 px-3 py-2.5"><span className="text-muted-foreground w-15 shrink-0 font-sans text-[10px] font-bold tracking-wide uppercase">Usuario</span><span className="min-w-0 flex-1 truncate">{r.username}</span><Button aria-label="Copiar usuario Dhru" size="icon-xs" variant="ghost" onClick={()=>copyDhruValue(r.id,r.username,"user")}>{isCopied("user")?<Check/>:<Copy/>}</Button></div>
              <div className="flex items-center gap-2 px-3 py-2.5"><span className="text-muted-foreground w-15 shrink-0 font-sans text-[10px] font-bold tracking-wide uppercase">API key</span><span className="min-w-0 flex-1 truncate">{keyVisible ? keyText : maskedKey}</span><Button aria-label={keyVisible?"Ocultar API key":"Mostrar API key"} size="icon-xs" variant="ghost" onClick={()=>setVisibleKeyId(keyVisible?null:r.id)}>{keyVisible?<EyeOff/>:<Eye/>}</Button><Button aria-label="Copiar API key Dhru" size="icon-xs" variant="ghost" onClick={()=>copyDhruValue(r.id,keyText,"key")} disabled={!keyText}>{isCopied("key")?<Check/>:<Copy/>}</Button></div>
            </div>
            <p className="text-muted-foreground mt-3 text-[11px]">La API key autoriza cobros y activaciones. Compártela solo con este revendedor.</p>
            <div className="mt-4 flex gap-2"><Button size="sm" onClick={()=>credit(r.id)}>Recargar saldo</Button><Button size="sm" variant="outline" onClick={()=>editReseller(r)}><Pencil/>Configurar precios</Button></div>
          </div>
        </article>;
      })}</div></section>}
      {tab==="security" && <TotpSecurity/>}
    </main></div>;
}
