export const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Características", href: "#features" },
  { label: "Precios", href: "#pricing" },
  { label: "Manuales", href: "/instructions.html" },
  { label: "Distribuidores", href: "#resellers" },
];

export type ChangelogLine =
  | { type: "h1"; text: string }
  | { type: "comment"; text: string }
  | { type: "h2"; text: string }
  | { type: "plus"; text: string }
  | { type: "pending"; text: string }
  | { type: "blank" };

export const changelog: ChangelogLine[] = [
  { type: "h1", text: "# MDM LOCKS — ArepaTool v2.1.0" },
  { type: "comment", text: "## Nuevas Funciones y Mejoras — 2026" },
  { type: "blank" },
  { type: "h2", text: "### Apple — Bypass & Format" },
  { type: "plus", text: "Fix Bypass A12+ y mejoras de estabilidad" },
  { type: "plus", text: "iPhone Chips A12 / A13 — Format Erase" },
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
  image: string;
  title: string;
  accent: string;
  bullets: string[];
  hero?: boolean;
}

export const features: Feature[] = [
  {
    filename: "ArepaWifi.sh",
    badge: "ACTIVE",
    image: "/pngs/arepamdm.png",
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
    image: "/pngs/arepadnsgeneradora.png",
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
    image: "/pngs/arepafixbanks.png",
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
    image: "/pngs/arepaa12+.png",
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
    image: "/pngs/arepamotorola.png",
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
    image: "/pngs/areparemovemdm.png",
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
    image: "/pngs/arepaext4.png",
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
  payments: string;
  links: { icon: "whatsapp" | "telegram" | "globe"; href: string }[];
}

export const resellers: Reseller[] = [
  {
    name: "Leope-Gsm",
    logo: "/pngs/leopepe.png",
    region: "Worldwide",
    payments: "Payments: USDT - BINANCE - PEN",
    links: [
      { icon: "whatsapp", href: "https://chat.whatsapp.com/ItqFr6uwlrOEvkXZQLiYaj" },
      { icon: "telegram", href: "https://t.me/ctrone21" },
    ],
  },
  {
    name: "SmartBeUnlock",
    logo: "/pngs/smartbeunlock.png",
    region: "Worldwide",
    payments: "Payments: USDT - BINANCE",
    links: [
      { icon: "globe", href: "https://smartbeunlock.com" },
      { icon: "whatsapp", href: "https://wa.me/573226859899" },
    ],
  },
  {
    name: "Ohidera Unlocker",
    logo: "/pngs/ohideraunlocker.jpg",
    region: "Worldwide",
    payments: "Payments: USDT - BINANCE",
    links: [
      { icon: "globe", href: "https://ohideraunlocker.com" },
      { icon: "whatsapp", href: "https://wa.me/+8801660122234" },
    ],
  },
  {
    name: "JavierBaronGSM",
    logo: "/pngs/javierbarongsm.png",
    region: "Worldwide",
    payments: "Payments: BINANCE",
    links: [
      { icon: "globe", href: "https://javierbarongsm.com" },
      { icon: "whatsapp", href: "https://wa.me/15419309244" },
    ],
  },
];
