import { getNavLinks } from "./i18n";

export const navLinks = getNavLinks("es");
export { getNavLinks };

export type ChangelogLine =
  | { type: "h1"; text: string }
  | { type: "comment"; text: string }
  | { type: "h2"; text: string }
  | { type: "plus"; text: string }
  | { type: "fixed"; text: string }
  | { type: "pending"; text: string }
  | { type: "blank" };

export const changelog: ChangelogLine[] = [
  { type: "h1", text: "# ArepaTool v2.2.4" },
  { type: "comment", text: "## Nuevos métodos · Samsung · Unisoc — 2026" },
  { type: "blank" },
  { type: "h2", text: "### 🔓 Infinix · Tecno — Unlock Bootloader" },
  { type: "plus", text: "Patch LK para desbloqueo de bootloader" },
  { type: "plus", text: "Soporte AARCH64 y ARM32" },
  { type: "pending", text: "Algunos modelos continúan en fase beta" },
  { type: "pending", text: "Antes de iniciar, respalda tu archivo LK. Si el equipo queda en logo, restáuralo." },
  { type: "blank" },
  { type: "h2", text: "### 📲 Samsung — FRP Exynos" },
  { type: "plus", text: "FRP vía modo de descarga" },
  { type: "plus", text: "Compatibilidad con todos los chipsets Exynos" },
  { type: "pending", text: "Las versiones más recientes de Android aún no están soportadas" },
  { type: "blank" },
  { type: "h2", text: "### ⚡ ZTE · Nubia — Unisoc" },
  { type: "plus", text: "Eliminar FRP · restablecimiento de fábrica · eliminar PayJoy" },
  { type: "plus", text: "ZTE Blade A55 4G (Z2450) · Nubia A36 (Z2472) · Nubia Air 5G (Z2468N)" },
  { type: "plus", text: "Nubia Neo 3 GT 5G (Z2465N) · Nubia Neo 3 5G (Z2464N) · Blade V60 Design / A75 4G (Z2359)" },
  { type: "blank" },
  { type: "h2", text: "### 🚀 Tecno · Itel — Spreadtrum / Unisoc" },
  { type: "plus", text: "Activar ADB y eliminar PayJoy" },
  { type: "plus", text: "Soporte ampliado para las series Pop, Spark, A, P, Vision y S" },
  { type: "comment", text: "Modelos compatibles disponibles directamente en la herramienta." },
  { type: "blank" },
  { type: "h1", text: "# ArepaTool v2.2.2" },
  { type: "comment", text: "## Infinix · Tecno · Itel — ROM Patch MTK" },
  { type: "blank" },
  { type: "h2", text: "### ROM Patch para dispositivos con plugin de seguridad" },
  { type: "plus", text: "Base de datos de ROM Patch para Infinix y Tecno" },
  { type: "plus", text: "Requiere bootloader desbloqueado antes de aplicar el método" },
  { type: "blank" },
  { type: "h2", text: "### Nuevo soporte MediaTek" },
  { type: "plus", text: "Soporte MTK añadido para Infinix, Tecno e Itel" },
  { type: "plus", text: "Eliminar FRP, bypass de PayJoy y restablecimiento de fábrica" },
  { type: "blank" },
  { type: "h2", text: "### Modelos iniciales" },
  { type: "plus", text: "Infinix Smart 8 / Smart 8 Pro / Smart 9 HD / HOT 40i / HOT 50i" },
  { type: "plus", text: "Infinix NOTE 50 / NOTE 50 Pro / NOTE 50X 5G / NOTE 50 Pro+ 5G" },
  { type: "plus", text: "Tecno Camon 20 / Camon 20 Pro / Camon 30 5G / Camon 30S Pro" },
  { type: "plus", text: "Tecno Spark 20C / Spark 20 Pro+ / Spark Go 2024 / Pova 6" },
  { type: "blank" },
  { type: "h1", text: "# ArepaTool v2.2.1" },
  { type: "comment", text: "## Xiaomi · MDM · Correcciones de conectividad — 2026" },
  { type: "blank" },
  { type: "h2", text: "### Xiaomi — QR MDM" },
  { type: "plus", text: "Nuevo método QR MDM para dispositivos Xiaomi" },
  { type: "plus", text: "Eliminación de aplicaciones MDM" },
  { type: "blank" },
  { type: "h2", text: "### MDM No DNS — Conectividad" },
  { type: "fixed", text: "FIX: sin conexión a internet en dispositivos Unisoc — TESTED" },
  { type: "fixed", text: "FIX: conectividad en algunos MediaTek y Unisoc — TESTED" },
  { type: "blank" },
  { type: "h1", text: "# ArepaTool v2.2.0" },
  { type: "comment", text: "## Novedades y correcciones — 2026" },
  { type: "blank" },
  { type: "h2", text: "### Transsion · Infinix · Tecno · Itel" },
  { type: "plus", text: "Compatibilidad con chipsets MediaTek" },
  { type: "plus", text: "Boot preloaded to Meta Mode" },
  { type: "plus", text: "Wipe FRP" },
  { type: "plus", text: "Eliminar PayJoy en MDM" },
  { type: "plus", text: "Restablecimiento de fábrica seguro" },
  { type: "blank" },
  { type: "h2", text: "### ArepaRedirector" },
  { type: "plus", text: "Nuevo módulo para realizar trabajos remotos" },
  { type: "plus", text: "Úsalo desde ArepaTool o con otras herramientas compatibles" },
  { type: "blank" },
  { type: "h2", text: "### Apple — A12/A13" },
  { type: "plus", text: "Soporte de código de acceso para iOS 18.0 a 26.6" },
  { type: "pending", text: "Hello A12/A13 — próximamente" },
  { type: "pending", text: "Requiere placas RP2350 (Pico 2)" },
  { type: "blank" },
  { type: "h2", text: "### Correcciones y experiencia" },
  { type: "plus", text: "Mejoras de compatibilidad de ArepaHotspot" },
  { type: "plus", text: "Nueva interfaz con modo claro y oscuro" },
  { type: "blank" },
  { type: "h1", text: "# MDM LOCKS — ArepaTool v2.1.3" },
  { type: "comment", text: "## Nuevas Funciones y Correcciones — 2026" },
  { type: "blank" },
  { type: "h2", text: "### Samsung KG — DNS" },
  { type: "plus", text: "Fix Samsung KG Locked DNS Profile 2026" },
  { type: "blank" },
  { type: "h2", text: "### Motorola MediaTek — Fastboot" },
  { type: "plus", text: "Eliminar FRP vía Fastboot para Moto G05, G06, G15 y G17" },
  { type: "plus", text: "Desbloqueo temporal de bootloader agregado" },
  { type: "blank" },
  { type: "h2", text: "### NVDATA" },
  { type: "plus", text: "NVData Repair IMEI agregado" },
  { type: "blank" },
  { type: "h1", text: "# MDM LOCKS — ArepaTool v2.1.2" },
  { type: "comment", text: "## Nuevas Funciones y Mejoras — 2026" },
  { type: "blank" },
  { type: "h2", text: "### Samsung — FULL TESTED" },
  { type: "plus", text: "Fix Yape 2026 Samsung FULL TESTED!!" },
  { type: "blank" },
  { type: "h2", text: "### Motorola MediaTek — FRP" },
  { type: "plus", text: "Nuevas versiones de Android agregadas para Moto MTK FRP" },
  { type: "blank" },
  { type: "h2", text: "### MDM No DNS" },
  { type: "plus", text: "QR FULLY TESTED!!" },
  { type: "blank" },
  { type: "h2", text: "### Apple — Bypass & Format" },
  { type: "plus", text: "Fix Bypass A12+ y mejoras de estabilidad" },
  { type: "plus", text: "iPhone con chips A12 / A13 — borrado completo" },
  { type: "pending", text: "Requiere hardware: RP2350-USB PICO 2" },
  { type: "blank" },
  { type: "h2", text: "### Motorola MediaTek — VAL Protocol" },
  { type: "plus", text: "Fastboot Unlock Bootloader" },
  { type: "plus", text: "FRP Reset" },
  { type: "plus", text: "FRP+ Reset" },
  { type: "plus", text: "One Click Fastboot Mode" },
  { type: "plus", text: "Soporte para la mayoría de modelos 2023-2026" },
  { type: "pending", text: "Disclaimer: Dispositivos sometidos a pagos como Payjoy se realizan bajo tu propio riesgo" },
  { type: "pending", text: "Más modelos se irán agregando al servidor progresivamente" },
  { type: "blank" },
  { type: "h2", text: "### DNS — Servidores" },
  { type: "plus", text: "Nuevos servidores DNS agregados" },
  { type: "blank" },
  { type: "h2", text: "### Experiencia de Usuario" },
  { type: "plus", text: "Animaciones didácticas para usuarios inexpertos" },
  { type: "blank" },
  { type: "h1", text: "# MDM LOCKS — ArepaTool v2.0.8" },
  { type: "comment", text: "## Funciones y Mejoras Anteriores — 2026" },
  { type: "blank" },
  { type: "h2", text: "### ArepaHotspot" },
  { type: "plus", text: "Solución para dispositivos que piden WiFi obligatorio al iniciar la configuracion" },
  { type: "plus", text: "Agregado PlayProtect block, Para KG Samsung Setup" },
  { type: "blank" },
  { type: "h2", text: "### DNS — Mejoras" },
  { type: "plus", text: "Borrar DNS creadas" },
  { type: "plus", text: "Historial de DNS Generadas" },
  { type: "plus", text: "Agregar Dominios a una DNS existente" },
  { type: "plus", text: "DNS Oppo Guard agregada agregada" },
  { type: "plus", text: "DNS Security Plugin agregada" },
  { type: "plus", text: "DNS Payjoy Locks agregada" },
  { type: "plus", text: "DNS Play Protect Agregada" },
  { type: "plus", text: "Oppo Guard APK agregado" },
  { type: "blank" },
  { type: "h2", text: "### MDM No DNS" },
  { type: "plus", text: "Para dispositivos donde el método DNS no funciona" },
  { type: "plus", text: "Nuevos parches 2026" },
  { type: "plus", text: "MDM Motorola Cricket & General — No DNS / No VPN" },
  { type: "blank" },
  { type: "h2", text: "### ArepaGuard / ArepaAdmin" },
  { type: "plus", text: "ArepaGuard bloquea actualizaciones del sistema" },
  { type: "plus", text: "Nueva interfaz UI mejorada" },
  { type: "blank" },
  { type: "h2", text: "### Módulo Apple" },
  { type: "plus", text: "Más versiones iOS añadidas" },
  { type: "plus", text: "Registros Automáticos" },
  { type: "plus", text: "Hidden iCloud agregado" },
  { type: "blank" },
  { type: "h2", text: "### Ext4 Explorer" },
  { type: "plus", text: "Eliminar archivos y carpetas" },
  { type: "plus", text: "Editar textos / HXD" },
  { type: "plus", text: "Cambiar permisos CHMOD" },
  { type: "plus", text: "Similar a EMMC File Manager" },
  { type: "blank" },
  { type: "h2", text: "### Correccion de errores" },
  { type: "plus", text: "Errores en el DNS de claro para Oppo Corregido." },
  { type: "plus", text: "Relocks en KG Samsung Corregido." },
  { type: "plus", text: "Problemas en Inicio de Sesion Corregido" },
  { type: "blank" },
];

export type FeatureBadge = "ACTIVE" | "NEW" | "BETA";

export interface Feature {
  filename: string;
  badge: FeatureBadge;
  title: string;
  accent: string;
  bullets: string[];
  hero?: boolean;
}

export const features: Feature[] = [
  {
    filename: "ArepaWifi.sh",
    badge: "ACTIVE",
    title: "AREPA",
    accent: "HOTSPOT",
    hero: true,
    bullets: [
      "Solucion para Dispositivos que piden WIFI en la configuracion inicial.",
      "Funciona en Motorola, Xiaomi, Honor, Huawei, Vivo, Oppo, y mas!",
      "Sporta ultimas veriones de Android",
      "Es Necesario que tu laptop o Pc pueda compartir internet por WiFi",
    ],
  },
  {
    filename: "dns-generator.sh",
    badge: "ACTIVE",
    title: "DNS",
    accent: "Creator",
    bullets: [
      "Borrar DNS creadas",
      "Historial de DNS Generadas",
      "Agregar Dominios a DNS existente",
      "Genera DNSs Ilimitadas",
      "Soportado : Payjoy - Play Protect - IT ADMIN - Kiosko - Claro - WhiteScreen MOTO - Oppo Color Lock - Security Plugin & Mas",
    ],
  },
  {
    filename: "fix-banking.sh",
    badge: "ACTIVE",
    title: "Fix Apps",
    accent: "Bancarias",
    bullets: [
      "Bancos de todo Latam Soportados",
      "Hide ROOT Avanzado",
      "Soporta Magisk / Delta / Alpha",
    ],
  },
  {
    filename: "ios-bypass.sh",
    badge: "ACTIVE",
    title: "iOS Bypass",
    accent: "A12+",
    bullets: [
      "Soporte iOS 16.7.1 — 26.1",
      "Bypass para iPhone 8 hasta iPhone 17 Pro Max",
      "Hidden Icloud Support",
    ],
  },
  {
    filename: "motorola-mdm.sh",
    badge: "NEW",
    title: "Motorola",
    accent: "ALL MDM",
    bullets: [
      "Support Moto 5G Phones Cricket",
      "Support AT&T Devices",
      "Support New Securities 2026",
      "No DNS / No VPN Method",
    ],
  },
  {
    filename: "remove-mdm.sh",
    badge: "BETA",
    title: "MDM",
    accent: "No DNS",
    bullets: [
      "Nuevos Metodos 2026 No DNS NO VPN",
      "Nuevos parches 2026",
      "Claro No Soportado",
    ],
  },
  {
    filename: "ext4-explorer.sh",
    badge: "NEW",
    title: "Ext4",
    accent: "Explorer",
    bullets: [
      "Eliminar archivos y carpetas",
      "Editar textos / HXD",
      "Cambiar permisos CHMOD",
      "Similar a EMMC File Manager",
    ],
  },
];

export interface Tutorial {
  videoId: string;
  title: string;
}

export const tutorials: Tutorial[] = [
  { videoId: "xV3EEy-3qO4", title: "instalacion de DNS para remover Bloqueos Tutorial" },
  { videoId: "K-MmrArDFmU", title: "Fix Apps bancarias y como rootear Tutorial" },
  { videoId: "nHY0MUdkfBA", title: "Fix Anuncio de alerta despues de Rootear Tutorial" },
];

export interface Reseller {
  name: string;
  logo: string;
  region: string;
  details: string;
  role: "distributor" | "reseller";
  links: { icon: "whatsapp" | "telegram" | "globe"; href: string }[];
}

export const resellers: Reseller[] = [
  {
    name: "Leope-Gsm",
    logo: "/pngs/leopepe.png",
    region: "Worldwide",
    details: "Payments: USDT - BINANCE - PEN",
    role: "distributor",
    links: [
      { icon: "whatsapp", href: "https://chat.whatsapp.com/ItqFr6uwlrOEvkXZQLiYaj" },
      { icon: "telegram", href: "https://t.me/ctrone21" },
    ],
  },
  {
    name: "SmartBeUnlock",
    logo: "/pngs/smartbeunlock.png",
    region: "Worldwide",
    details: "Payments: USDT - BINANCE",
    role: "reseller",
    links: [
      { icon: "globe", href: "https://smartbeunlock.com" },
      { icon: "whatsapp", href: "https://wa.me/573226859899" },
    ],
  },
  {
    name: "Ohidera Unlocker",
    logo: "/pngs/ohideraunlocker.jpg",
    region: "Worldwide",
    details: "Payments: USDT - BINANCE",
    role: "reseller",
    links: [
      { icon: "globe", href: "https://ohideraunlocker.com" },
      { icon: "whatsapp", href: "https://wa.me/+8801660122234" },
    ],
  },
  {
    name: "JavierBaronGSM",
    logo: "/pngs/javierbarongsm.png",
    region: "Worldwide",
    details: "Payments: BINANCE",
    role: "reseller",
    links: [
      { icon: "globe", href: "https://javierbarongsm.com" },
      { icon: "whatsapp", href: "https://wa.me/15419309244" },
    ],
  },
  {
    name: "Elmexicanounlock.com",
    logo: "/pngs/elmexicanounlock.jpeg",
    region: "México",
    details: "WhatsApp: +52 55 7989 8071",
    role: "reseller",
    links: [
      { icon: "whatsapp", href: "https://wa.me/525579898071" },
      { icon: "telegram", href: "https://t.me/elmexicanounlockmx" },
    ],
  },
  {
    name: "MHUnlock.com",
    logo: "/pngs/mhunlock.jpeg",
    region: "Worldwide",
    details: "Worldwide Reseller",
    role: "reseller",
    links: [
      { icon: "globe", href: "https://mhunlock.com/" },
      { icon: "whatsapp", href: "https://wa.me/12543511079" },
      { icon: "telegram", href: "https://t.me/mhunlock" },
    ],
  },
  {
    name: "HR Unlocker",
    logo: "/pngs/hrunlocker.jpeg",
    region: "Ecuador",
    details: "WhatsApp: +593 97 941 6069",
    role: "reseller",
    links: [
      { icon: "globe", href: "https://hrunlock.com/" },
      { icon: "whatsapp", href: "https://wa.me/593979416069" },
      { icon: "telegram", href: "https://t.me/HamilSotalin" },
    ],
  },
];
