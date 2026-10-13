declare module "simple-apk-parser" {
  export function parseApkFile(file: Blob): Promise<{
    appName?: string | null;
    packageName?: string | null;
    versionName?: string | null;
    iconBlob?: Blob | null;
  }>;
}
