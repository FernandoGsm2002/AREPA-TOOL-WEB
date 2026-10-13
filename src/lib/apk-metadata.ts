import { BlobReader, BlobWriter, ZipReader, type Entry, type FileEntry } from "@zip.js/zip.js";
import { parseApkFile } from "simple-apk-parser";

export type ApkMetadata = {
  name: string;
  version: string;
  packageName: string;
  icon: Blob | null;
  iconPreview: string;
};

const isFile = (entry: Entry): entry is FileEntry => !entry.directory;

async function innerApk(file: File): Promise<Blob> {
  if (/\.apk$/i.test(file.name)) return file;
  const zip = new ZipReader(new BlobReader(file));
  try {
    const entries = (await zip.getEntries()).filter((entry): entry is FileEntry =>
      isFile(entry) && /\.apk$/i.test(entry.filename));
    const base = entries.find(entry => /(^|\/)base\.apk$/i.test(entry.filename)) ?? entries[0];
    if (!base) throw new Error("El paquete no contiene un APK base.");
    return await base.getData(new BlobWriter("application/vnd.android.package-archive"));
  } finally { await zip.close(); }
}

async function findIcon(apk: Blob): Promise<Blob | null> {
  const zip = new ZipReader(new BlobReader(apk));
  try {
    const entries = await zip.getEntries();
    const candidates = entries.filter((entry): entry is FileEntry =>
      isFile(entry) && /^res\//.test(entry.filename) &&
      /(?:ic_launcher|app_icon|launcher_icon)[^/]*\.(png|webp)$/i.test(entry.filename));
    const preferred = candidates.sort((a, b) =>
      Number(/xxxhdpi|xxhdpi|xhdpi/i.test(b.filename)) - Number(/xxxhdpi|xxhdpi|xhdpi/i.test(a.filename)))[0];
    return preferred ? await preferred.getData(new BlobWriter()) : null;
  } finally { await zip.close(); }
}

async function asPng(icon: Blob): Promise<Blob> {
  const image = await createImageBitmap(icon);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 128; canvas.height = 128;
    canvas.getContext("2d")?.drawImage(image, 0, 0, 128, 128);
    const png = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
    if (!png) throw new Error("No se pudo convertir el icono a PNG.");
    return png;
  } finally { image.close(); }
}

export async function readApkMetadata(file: File): Promise<ApkMetadata> {
  const apk = await innerApk(file);
  const parsed = await parseApkFile(apk);
  let icon: Blob | null = null;
  if (parsed.iconBlob) {
    try { icon = await asPng(parsed.iconBlob); } catch { /* Try a raster launcher resource below. */ }
  }
  if (!icon) {
    const fallback = await findIcon(apk);
    if (fallback) icon = await asPng(fallback);
  }
  return {
    name: parsed.appName || "",
    version: parsed.versionName || "",
    packageName: parsed.packageName || "",
    icon,
    iconPreview: icon ? await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(icon);
    }) : "",
  };
}
