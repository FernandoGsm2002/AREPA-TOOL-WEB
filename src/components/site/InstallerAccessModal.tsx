import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Flame, Loader2 } from "lucide-react";
import { modalCopy, type Locale } from "@/lib/i18n";

const API_BASE = "https://api2.arepatool.com";
const INSTALLER_FILE_NAME = "ArepaToolV2_Setup_v2.2.7.exe";

export default function InstallerAccessModal({ locale = "es" }: { locale?: Locale }) {
  const copy = modalCopy[locale];
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-installer-access", openHandler);
    return () => window.removeEventListener("open-installer-access", openHandler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setStatus(null);
    setDownloadUrl(null);
    setLoading(true);

    fetch(`${API_BASE}/api/installer-access`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.downloadUrl) throw new Error(data.error || "download_unavailable");
        setDownloadUrl(data.downloadUrl);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setStatus(locale === "es"
            ? "No se pudo preparar la descarga pública."
            : locale === "pt-br"
              ? "Não foi possível preparar o download público."
              : "The public download could not be prepared.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [open, retry, locale]);

  const preparingText = locale === "es"
    ? "Preparando descarga pública…"
    : locale === "pt-br"
      ? "Preparando download público…"
      : "Preparing public download…";
  const retryText = locale === "es" ? "Reintentar" : locale === "pt-br" ? "Tentar novamente" : "Retry";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="bg-primary/12 text-primary flex size-14 items-center justify-center rounded-full"><Flame className="size-7" /></div>
          <DialogTitle className="text-xl">{copy.downloadTitle}</DialogTitle>
        </DialogHeader>
        {downloadUrl ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm leading-6">{copy.accessConfirmed}</p>
            <div className="border-primary/35 from-primary/16 via-primary/8 to-background relative overflow-hidden rounded-2xl border bg-linear-to-br px-5 py-4 shadow-lg shadow-primary/10">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/80 to-transparent" />
              <Flame className="text-primary mx-auto size-7 motion-safe:animate-pulse" />
              <p className="mt-2 font-semibold">{copy.newVersion}</p>
              <p className="text-muted-foreground mt-1 text-xs">{INSTALLER_FILE_NAME}</p>
            </div>
            <Button asChild className="w-full shadow-xl shadow-primary/30 motion-safe:animate-pulse">
              <a href={downloadUrl} download={INSTALLER_FILE_NAME}><Download className="size-4" />{copy.downloadNow}</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm leading-6">{loading ? preparingText : status}</p>
            {loading && <div className="flex justify-center"><Loader2 className="text-primary size-6 animate-spin" /></div>}
            {!loading && status && <Button className="w-full" variant="outline" onClick={() => setRetry((value) => value + 1)}><Download className="size-4" />{retryText}</Button>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
