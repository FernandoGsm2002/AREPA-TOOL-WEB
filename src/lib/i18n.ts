export const locales = ["es", "en", "pt-br"] as const;
export type Locale = (typeof locales)[number];

export const localeOptions = [
  { code: "es" as const, label: "Español", short: "ES" },
  { code: "en" as const, label: "English", short: "EN" },
  { code: "pt-br" as const, label: "Português (Brasil)", short: "PT" },
];

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function localeFromPath(pathname: string): Locale {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : "es";
}

export function withoutLocale(pathname: string): string {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const stripped = cleanPath.replace(/^\/(?:es|en|pt-br)(?=\/|$)/, "");
  return stripped || "/";
}

export function localizedPath(locale: Locale, pathname: string): string {
  const path = withoutLocale(pathname);
  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}

export const localeCopy = {
  es: {
    language: "Idioma",
    nav: {
      home: "Inicio",
      models: "Modelos soportados",
      updates: "Actualizaciones",
      features: "Características",
      tutorials: "Tutoriales",
      instructions: "Manuales",
      pricing: "Precios",
      resellers: "Distribuidores",
      whatsapp: "Grupo WhatsApp",
      login: "Iniciar sesión",
      register: "Registro",
    },
    announcement: {
      aria: "Novedad de ArepaTool",
      label: "NUEVO",
      text: "ROM Patch para",
      brands: "Infinix, Tecno e Itel",
      action: "Inicia sesión y ve a Descargas",
    },
    hero: {
      kicker: "Modern software",
      titleAccent: "Professional tool for you.",
      description: "A modern tool designed for unlockers like you",
      platform: "Windows",
      license: "Licencia protegida",
      licenseCta: "Ver licencia",
      downloadCta: "Descargar ArepaTool",
      proofLabel: "Módulos principales",
      tagline: "Compatible with modern brands on the market",
      mascotAlt: "Mascota de ArepaTool trabajando en un equipo Windows",
    },
    release: { kicker: "Latest release", whatsNew: "17/09/2026 · What’s new?", stable: "stable" },
    pricing: {
      kicker: "ArepaTool licensing",
      title: "Choose your plan",
      description: "Our updates are always free. Access every release with an active ArepaTool license.",
      popular: "Popular",
      price: "Price /",
      buyNow: "Buy Now",
      reseller: "Buy From Resellers",
      plans: [
        { eyebrow: "ArepaTool Rent", name: "Tool Rental", duration: "12 hours", price: "4", description: "PayPal, crypto or reseller activation." },
        { eyebrow: "ArepaTool Pro", name: "Professional", duration: "3 months", price: "12", description: "Professional access for your workshop." },
        { eyebrow: "ArepaTool Pro", name: "Professional", duration: "6 months", price: "19", description: "The balanced plan for active unlockers." },
        { eyebrow: "ArepaTool Pro", name: "Professional", duration: "1 year", price: "26", description: "Full-year access for your daily work." },
      ],
    },
    updates: {
      title: "Changelog of changes in ArepaTool.",
      description: "Mantente al tanto de las actualizaciones; solemos publicar novedades con frecuencia.",
      current: "Versión actual",
    },
    tutorials: {
      title: "Tutoriales oficiales de ArepaTool.",
      description: "Prepara tu equipo, elige el método correcto y ejecuta cada operación con más contexto.",
      videoTitle: "YouTube video player",
    },
    instructions: {
      title: "Manuales para preparar tu próximo trabajo.",
      description: "Revisa el flujo general antes de conectar un equipo y consulta los tutoriales oficiales cuando necesites una guía paso a paso.",
      steps: [
        ["Verifica la cobertura", "Busca el modelo exacto en Modelos soportados y confirma el chipset y la operación disponible."],
        ["Descarga la herramienta", "Inicia sesión para acceder a la descarga protegida y prepara tu equipo Windows con los controladores necesarios."],
        ["Prepara el dispositivo", "Realiza respaldos y sigue las advertencias del método antes de iniciar cualquier operación."],
        ["Ejecuta y registra", "Completa el flujo desde ArepaTool y conserva el resultado para tu historial de trabajo."],
      ],
    },
    resellers: {
      title: "Habla con un distribuidor verificado.",
      description: "Compra tu licencia con un vendedor autorizado. No caigas en estafas.",
      official: "Distribuidor oficial",
      officialLabel: "Oficial",
      resellers: "Resellers oficiales",
      resellerLabel: "Reseller",
    },
    models: {
      title: "Modelos soportados",
      ariaBrands: "Marcas de modelos soportados",
      motorola: "Modelos Motorola soportados",
      transsion: "Infinix · Tecno · Itel",
      search: "Buscar modelo o SKU",
      androidFilter: "Filtrar por Android",
      all: "Todos",
      visibleOne: "modelo visible",
      visibleMany: "modelos visibles",
      test: "Modelos para test",
      empty: "No encontramos un modelo compatible.",
      operations: { unlock: "Unlock BL", frp: "Android FRP", tempUnlock: "Temp Unlock BL" },
      transsionDescription: "ROM Patch Fastboot y operaciones Meta para dispositivos Transsion.",
      syncing: "Sincronizando ROM Patch…",
      romSupport: "ROM Patch vía Fastboot",
      tested: "ROMs completamente testeadas",
      requirement: "Requisito obligatorio:",
      requirementText: "bootloader desbloqueado. ArepaTool no desbloquea el bootloader.",
      loading: "Cargando modelos disponibles…",
      failed: "No se pudo sincronizar el catálogo en este momento. Intenta actualizar la página.",
      romEmpty: "Aún no hay ROM Patch publicadas con esa búsqueda.",
      meta: "Operaciones vía Meta",
      metaDescription: "FRP, Factory Reset y PayJoy disponibles en modo Meta.",
      metaEmpty: "No encontramos modelos Meta con esa búsqueda.",
      model: "Modelo",
    },
    footer: {
      support: "Support",
      supportText: "Our support team is ready to help you with any questions or comments you may have! The staff will answer incoming emails within 24 hours. The official support language is English.",
      useful: "Useful links",
      account: "My account",
      download: "Download modules",
      downloadText: "Access your account to download the latest ArepaTool modules.",
      downloadAction: "Access downloads",
      login: "Login",
      signup: "Sign Up",
      forgot: "Forgot Password",
      contact: "Contactar",
      copyright: "Designed by ArepaTool Developers · All rights reserved · © 2026",
      homeLabel: "ArepaTool inicio",
      social: "Redes sociales",
    },
  },
  en: {
    language: "Language",
    nav: {
      home: "Home",
      models: "Supported models",
      updates: "Updates",
      features: "Features",
      tutorials: "Tutorials",
      instructions: "Guides",
      pricing: "Pricing",
      resellers: "Resellers",
      whatsapp: "WhatsApp Group",
      login: "Log in",
      register: "Sign up",
    },
    announcement: { aria: "ArepaTool news", label: "NEW", text: "ROM Patch for", brands: "Infinix, Tecno & Itel", action: "Log in to open Downloads" },
    hero: { kicker: "Modern software", titleAccent: "Professional tool for you.", description: "A modern tool designed for unlockers like you", platform: "Windows", license: "Protected license", licenseCta: "View license", downloadCta: "Download ArepaTool", proofLabel: "Core modules", tagline: "Compatible with modern brands on the market", mascotAlt: "ArepaTool mascot working on a Windows computer" },
    release: { kicker: "Latest release", whatsNew: "17/09/2026 · What’s new?", stable: "stable" },
    pricing: { kicker: "ArepaTool licensing", title: "Choose your plan", description: "Our updates are always free. Access every release with an active ArepaTool license.", popular: "Popular", price: "Price /", buyNow: "Buy Now", reseller: "Buy From Resellers", plans: [
      { eyebrow: "ArepaTool Rent", name: "Tool Rental", duration: "12 hours", price: "4", description: "PayPal, crypto or reseller activation." },
      { eyebrow: "ArepaTool Pro", name: "Professional", duration: "3 months", price: "12", description: "Professional access for your workshop." },
      { eyebrow: "ArepaTool Pro", name: "Professional", duration: "6 months", price: "19", description: "The balanced plan for active unlockers." },
      { eyebrow: "ArepaTool Pro", name: "Professional", duration: "1 year", price: "26", description: "Full-year access for your daily work." },
    ] },
    updates: { title: "ArepaTool change log.", description: "Keep up with updates; we publish new improvements frequently.", current: "Current version" },
    tutorials: { title: "Official ArepaTool tutorials.", description: "Prepare your setup, choose the right method and run every operation with more context.", videoTitle: "YouTube video player" },
    instructions: { title: "Guides for your next repair.", description: "Review the general flow before connecting a device and use the official tutorials whenever you need a step-by-step guide.", steps: [
      ["Check coverage", "Find the exact model in Supported models and confirm its chipset and available operation."],
      ["Download the tool", "Log in to access the protected download and prepare your Windows computer with the required drivers."],
      ["Prepare the device", "Back up your data and follow the method warnings before starting any operation."],
      ["Run and record", "Complete the flow in ArepaTool and keep the result in your work history."],
    ] },
    resellers: { title: "Talk to a verified distributor.", description: "Buy your license from an authorized seller. Do not fall for scams.", official: "Official distributor", officialLabel: "Official", resellers: "Official resellers", resellerLabel: "Reseller" },
    models: { title: "Supported models", ariaBrands: "Supported model brands", motorola: "Supported Motorola models", transsion: "Infinix · Tecno · Itel", search: "Search model or SKU", androidFilter: "Filter by Android", all: "All", visibleOne: "model visible", visibleMany: "models visible", test: "Test models", empty: "We couldn't find a compatible model.", operations: { unlock: "Unlock BL", frp: "Android FRP", tempUnlock: "Temp Unlock BL" }, transsionDescription: "Fastboot ROM Patch and Meta operations for Transsion devices.", syncing: "Syncing ROM Patch…", romSupport: "ROM Patch via Fastboot", tested: "Fully tested ROMs", requirement: "Required:", requirementText: "unlocked bootloader. ArepaTool does not unlock the bootloader.", loading: "Loading available models…", failed: "The catalog could not be synced right now. Try refreshing the page.", romEmpty: "No ROM Patches match that search yet.", meta: "Meta operations", metaDescription: "FRP, Factory Reset and PayJoy available in Meta mode.", metaEmpty: "No Meta models match that search.", model: "Model" },
    footer: { support: "Support", supportText: "Our support team is ready to help you with any questions or comments you may have! The staff will answer incoming emails within 24 hours. The official support language is English.", useful: "Useful links", account: "My account", download: "Download modules", downloadText: "Access your account to download the latest ArepaTool modules.", downloadAction: "Access downloads", login: "Log in", signup: "Sign up", forgot: "Forgot password", contact: "Contact", copyright: "Designed by ArepaTool Developers · All rights reserved · © 2026", homeLabel: "ArepaTool home", social: "Social links" },
  },
  "pt-br": {
    language: "Idioma",
    nav: { home: "Início", models: "Modelos compatíveis", updates: "Atualizações", features: "Recursos", tutorials: "Tutoriais", instructions: "Manuais", pricing: "Preços", resellers: "Revendedores", whatsapp: "Grupo do WhatsApp", login: "Entrar", register: "Criar conta" },
    announcement: { aria: "Novidade da ArepaTool", label: "NOVO", text: "ROM Patch para", brands: "Infinix, Tecno e Itel", action: "Entre para abrir os Downloads" },
    hero: { kicker: "Modern software", titleAccent: "Professional tool for you.", description: "A modern tool designed for unlockers like you", platform: "Windows", license: "Licença protegida", licenseCta: "Ver licença", downloadCta: "Baixar ArepaTool", proofLabel: "Módulos principais", tagline: "Compatível com marcas modernas do mercado", mascotAlt: "Mascote da ArepaTool trabalhando em um computador Windows" },
    release: { kicker: "Última versão", whatsNew: "17/09/2026 · O que há de novo?", stable: "estável" },
    pricing: { kicker: "Licenciamento ArepaTool", title: "Escolha seu plano", description: "Nossas atualizações são sempre gratuitas. Acesse cada versão com uma licença ArepaTool ativa.", popular: "Popular", price: "Preço /", buyNow: "Comprar agora", reseller: "Comprar com revendedores", plans: [
      { eyebrow: "ArepaTool Rent", name: "Aluguel da ferramenta", duration: "12 horas", price: "4", description: "PayPal, cripto ou ativação por revendedor." },
      { eyebrow: "ArepaTool Pro", name: "Profissional", duration: "3 meses", price: "12", description: "Acesso profissional para sua oficina." },
      { eyebrow: "ArepaTool Pro", name: "Profissional", duration: "6 meses", price: "19", description: "O plano equilibrado para unlockers ativos." },
      { eyebrow: "ArepaTool Pro", name: "Profissional", duration: "1 ano", price: "26", description: "Acesso anual para o seu trabalho diário." },
    ] },
    updates: { title: "Changelog de alterações da ArepaTool.", description: "Fique por dentro das atualizações; publicamos novidades com frequência.", current: "Versão atual" },
    tutorials: { title: "Tutoriais oficiais da ArepaTool.", description: "Prepare seu equipamento, escolha o método certo e execute cada operação com mais contexto.", videoTitle: "player de vídeo do YouTube" },
    instructions: { title: "Manuais para o seu próximo reparo.", description: "Revise o fluxo geral antes de conectar um aparelho e consulte os tutoriais oficiais quando precisar de um guia passo a passo.", steps: [
      ["Verifique a compatibilidade", "Procure o modelo exato em Modelos compatíveis e confirme o chipset e a operação disponível."],
      ["Baixe a ferramenta", "Entre para acessar o download protegido e prepare seu computador Windows com os drivers necessários."],
      ["Prepare o aparelho", "Faça backups e siga os avisos do método antes de iniciar qualquer operação."],
      ["Execute e registre", "Conclua o fluxo na ArepaTool e mantenha o resultado no seu histórico de trabalho."],
    ] },
    resellers: { title: "Fale com um distribuidor verificado.", description: "Compre sua licença com um vendedor autorizado. Não caia em golpes.", official: "Distribuidor oficial", officialLabel: "Oficial", resellers: "Revendedores oficiais", resellerLabel: "Revendedor" },
    models: { title: "Modelos compatíveis", ariaBrands: "Marcas de modelos compatíveis", motorola: "Modelos Motorola compatíveis", transsion: "Infinix · Tecno · Itel", search: "Buscar modelo ou SKU", androidFilter: "Filtrar por Android", all: "Todos", visibleOne: "modelo visível", visibleMany: "modelos visíveis", test: "Modelos para teste", empty: "Não encontramos um modelo compatível.", operations: { unlock: "Unlock BL", frp: "Android FRP", tempUnlock: "Temp Unlock BL" }, transsionDescription: "ROM Patch Fastboot e operações Meta para aparelhos Transsion.", syncing: "Sincronizando ROM Patch…", romSupport: "ROM Patch via Fastboot", tested: "ROMs totalmente testadas", requirement: "Obrigatório:", requirementText: "bootloader desbloqueado. A ArepaTool não desbloqueia o bootloader.", loading: "Carregando modelos disponíveis…", failed: "Não foi possível sincronizar o catálogo agora. Tente atualizar a página.", romEmpty: "Ainda não há ROM Patches para essa busca.", meta: "Operações via Meta", metaDescription: "FRP, Factory Reset e PayJoy disponíveis no modo Meta.", metaEmpty: "Nenhum modelo Meta corresponde à busca.", model: "Modelo" },
    footer: { support: "Suporte", supportText: "Nossa equipe de suporte está pronta para ajudar com suas dúvidas ou comentários. A equipe responderá aos e-mails em até 24 horas. O idioma oficial do suporte é inglês.", useful: "Links úteis", account: "Minha conta", download: "Baixar módulos", downloadText: "Acesse sua conta para baixar os módulos mais recentes da ArepaTool.", downloadAction: "Acessar downloads", login: "Entrar", signup: "Criar conta", forgot: "Esqueci a senha", contact: "Contato", copyright: "Desenvolvido pelos ArepaTool Developers · Todos os direitos reservados · © 2026", homeLabel: "Início da ArepaTool", social: "Redes sociais" },
  },
} as const;

export interface FeatureGroupCopy {
  eyebrow: string;
  title: string;
  bullets: string[];
  wide?: boolean;
}

export const featureCopy: Record<Locale, { quick: string[]; groups: FeatureGroupCopy[]; note: string }> = {
  es: {
    quick: ["MediaTek", "Fastboot", "ADB", "Unisoc", "Apple iOS"],
    groups: [
      { eyebrow: "Core protocols", title: "Protocolos base", wide: true, bullets: ["MediaTek para operaciones de servicio y reparación.", "Fastboot para diagnóstico, desbloqueo y escritura de ROMs modificadas.", "ADB para operaciones avanzadas y equipos rooteados.", "Unisoc para dispositivos Transsion y otras plataformas compatibles.", "Apple iOS para bypass, passcode y Hello en hardware compatible."] },
      { eyebrow: "Samsung", title: "Operaciones ADB", bullets: ["Activar ADB en Android OS 16.", "Eliminar FRP en Android OS 16.", "Cambiar CSC y eliminar FRP vía ADB.", "Eliminar cuenta Samsung vía ADB.", "Desactivar actualizaciones y recuperar apps bancarias.", "Fix Yape para dispositivos rooteados.", "Activar IMEI 2 vía ADB root.", "Borrar datos de usuario vía ADB."] },
      { eyebrow: "Samsung 2026", title: "Exynos Download Mode", bullets: ["Todos los procesadores Exynos soportados.", "FRP desde Download Mode.", "Flash mediante Odin.", "Compatibilidad con seguridades inferiores a 05/2026."] },
      { eyebrow: "Motorola MediaTek", title: "FRP y bootloader", bullets: ["FRP y unlock bootloader para dispositivos Motorola MediaTek.", "Soporte para la gran mayoría de equipos Motorola 2025 y 2026.", "Versiones de Android 11, 12, 13, 14, 15 y 16."] },
      { eyebrow: "Transsion", title: "Infinix · Itel · Tecno", bullets: ["Protocolo Meta para FRP, factory reset y PayJoy bypass.", "Fastboot para escribir ROMs modificadas.", "LK Editor para unlock bootloader en AARCH64 y ARM32.", "Soporte para security plugin y anticrack."] },
      { eyebrow: "Unisoc Transsion", title: "Factory reset y PayJoy", bullets: ["Unisoc para Infinix, Itel y Tecno.", "Factory reset y PayJoy con seguridades inferiores a 09/2026.", "Protocolo vía diagnóstico para puertos cerrados.", "FRP y factory reset en dispositivos compatibles."] },
      { eyebrow: "Honor 4G · 5G", title: "Reparación NVData", bullets: ["Reparación de NVData para dispositivos Honor 4G y 5G.", "Diagnóstico de conectividad y recuperación del equipo."] },
      { eyebrow: "ZTE · Nubia 2026", title: "Diagnóstico y reset", bullets: ["FRP y factory reset para ZTE y Nubia compatibles.", "Protocolo de diagnóstico para puertos cerrados.", "Operaciones Unisoc en modelos 2026."] },
      { eyebrow: "MDM Locks · DNS", title: "Bloqueos corporativos", wide: true, bullets: ["IT Admin, Kiosk, Claro y Telcel.", "White Screen y Oppo Locks.", "Métodos DNS y sin DNS.", "ADB sin relock.", "Método QR para equipos que piden Wi-Fi al iniciar.", "ArepaHotspot para editar la red inalámbrica y configurar el equipo sin riesgo de relock."] },
      { eyebrow: "Apple iOS", title: "Bypass y passcode", wide: true, bullets: ["Bypass Hello hasta iOS 26.1 en iPhone 11 hasta 17 Pro Max compatibles.", "A12 y A13: bypass passcode y Hello.", "Operaciones sin créditos en los métodos compatibles."] },
    ],
    note: "La compatibilidad puede depender del modelo exacto, chipset, versión de Android/iOS, nivel de seguridad y estado del bootloader. Revisa el soporte del equipo antes de comenzar.",
  },
  en: {
    quick: ["MediaTek", "Fastboot", "ADB", "Unisoc", "Apple iOS"],
    groups: [
      { eyebrow: "Core protocols", title: "Core protocols", wide: true, bullets: ["MediaTek service and repair operations.", "Fastboot for diagnostics, unlocking and modified ROM flashing.", "ADB for advanced operations and rooted devices.", "Unisoc for Transsion devices and other supported platforms.", "Apple iOS for bypass, passcode and Hello on compatible hardware."] },
      { eyebrow: "Samsung", title: "ADB operations", bullets: ["Enable ADB on Android OS 16.", "Remove FRP on Android OS 16.", "Change CSC and remove FRP via ADB.", "Remove Samsung account via ADB.", "Disable updates and restore banking apps.", "Yape fix for rooted devices.", "Enable IMEI 2 through ADB root.", "Erase user data through ADB."] },
      { eyebrow: "Samsung 2026", title: "Exynos Download Mode", bullets: ["All Exynos processors supported.", "FRP through Download Mode.", "Flash with Odin.", "Security levels below 05/2026 supported."] },
      { eyebrow: "Motorola MediaTek", title: "FRP and bootloader", bullets: ["FRP and bootloader unlock for Motorola MediaTek devices.", "Support for most Motorola devices from 2025 and 2026.", "Android 11, 12, 13, 14, 15 and 16."] },
      { eyebrow: "Transsion", title: "Infinix · Itel · Tecno", bullets: ["Meta protocol for FRP, factory reset and PayJoy bypass.", "Fastboot for modified ROM flashing.", "LK Editor for AARCH64 and ARM32 bootloader unlock.", "Security plugin and anticrack support."] },
      { eyebrow: "Unisoc Transsion", title: "Factory reset and PayJoy", bullets: ["Unisoc for Infinix, Itel and Tecno.", "Factory reset and PayJoy below 09/2026 security.", "Diagnostic protocol for closed ports.", "FRP and factory reset on compatible devices."] },
      { eyebrow: "Honor 4G · 5G", title: "NVData repair", bullets: ["NVData repair for Honor 4G and 5G devices.", "Connectivity diagnostics and device recovery."] },
      { eyebrow: "ZTE · Nubia 2026", title: "Diagnostics and reset", bullets: ["FRP and factory reset for compatible ZTE and Nubia devices.", "Diagnostic protocol for closed ports.", "Unisoc operations on 2026 models."] },
      { eyebrow: "MDM Locks · DNS", title: "Corporate locks", wide: true, bullets: ["IT Admin, Kiosk, Claro and Telcel.", "White Screen and Oppo Locks.", "DNS and non-DNS methods.", "ADB without relock.", "QR method for devices that require Wi-Fi during setup.", "ArepaHotspot to edit the wireless network and configure the device without relock risk."] },
      { eyebrow: "Apple iOS", title: "Bypass and passcode", wide: true, bullets: ["Hello bypass up to iOS 26.1 on compatible iPhone 11 through 17 Pro Max.", "A12 and A13: passcode and Hello bypass.", "Credit-free operations on supported methods."] },
    ],
    note: "Compatibility may depend on the exact model, chipset, Android/iOS version, security level and bootloader state. Check device support before starting.",
  },
  "pt-br": {
    quick: ["MediaTek", "Fastboot", "ADB", "Unisoc", "Apple iOS"],
    groups: [
      { eyebrow: "Protocolos principais", title: "Protocolos base", wide: true, bullets: ["MediaTek para operações de serviço e reparo.", "Fastboot para diagnóstico, desbloqueio e gravação de ROMs modificadas.", "ADB para operações avançadas e aparelhos rooteados.", "Unisoc para aparelhos Transsion e outras plataformas compatíveis.", "Apple iOS para bypass, passcode e Hello em hardware compatível."] },
      { eyebrow: "Samsung", title: "Operações ADB", bullets: ["Ativar ADB no Android OS 16.", "Remover FRP no Android OS 16.", "Alterar CSC e remover FRP via ADB.", "Remover conta Samsung via ADB.", "Desativar atualizações e recuperar apps bancários.", "Fix Yape para aparelhos rooteados.", "Ativar IMEI 2 via ADB root.", "Apagar dados do usuário via ADB."] },
      { eyebrow: "Samsung 2026", title: "Exynos Download Mode", bullets: ["Todos os processadores Exynos compatíveis.", "FRP pelo Download Mode.", "Flash via Odin.", "Compatibilidade com seguranças inferiores a 05/2026."] },
      { eyebrow: "Motorola MediaTek", title: "FRP e bootloader", bullets: ["FRP e unlock bootloader para aparelhos Motorola MediaTek.", "Suporte à maioria dos aparelhos Motorola de 2025 e 2026.", "Android 11, 12, 13, 14, 15 e 16."] },
      { eyebrow: "Transsion", title: "Infinix · Itel · Tecno", bullets: ["Protocolo Meta para FRP, factory reset e PayJoy bypass.", "Fastboot para gravar ROMs modificadas.", "LK Editor para unlock bootloader em AARCH64 e ARM32.", "Suporte a security plugin e anticrack."] },
      { eyebrow: "Unisoc Transsion", title: "Factory reset e PayJoy", bullets: ["Unisoc para Infinix, Itel e Tecno.", "Factory reset e PayJoy com seguranças inferiores a 09/2026.", "Protocolo de diagnóstico para portas fechadas.", "FRP e factory reset em aparelhos compatíveis."] },
      { eyebrow: "Honor 4G · 5G", title: "Reparo de NVData", bullets: ["Reparo de NVData para aparelhos Honor 4G e 5G.", "Diagnóstico de conectividade e recuperação do aparelho."] },
      { eyebrow: "ZTE · Nubia 2026", title: "Diagnóstico e reset", bullets: ["FRP e factory reset para ZTE e Nubia compatíveis.", "Protocolo de diagnóstico para portas fechadas.", "Operações Unisoc em modelos 2026."] },
      { eyebrow: "MDM Locks · DNS", title: "Bloqueios corporativos", wide: true, bullets: ["IT Admin, Kiosk, Claro e Telcel.", "White Screen e Oppo Locks.", "Métodos DNS e sem DNS.", "ADB sem relock.", "Método QR para aparelhos que pedem Wi-Fi na configuração.", "ArepaHotspot para editar a rede sem fio e configurar o aparelho sem risco de relock."] },
      { eyebrow: "Apple iOS", title: "Bypass e passcode", wide: true, bullets: ["Bypass Hello até iOS 26.1 em iPhones 11 até 17 Pro Max compatíveis.", "A12 e A13: bypass de passcode e Hello.", "Operações sem créditos nos métodos compatíveis."] },
    ],
    note: "A compatibilidade pode depender do modelo exato, chipset, versão do Android/iOS, nível de segurança e estado do bootloader. Consulte o suporte do aparelho antes de começar.",
  },
};

export const modalCopy: Record<Locale, {
  downloadTitle: string;
  accessConfirmed: string;
  newVersion: string;
  downloadNow: string;
  joinOfficial: string;
  verifyDescription: string;
  identifierPlaceholder: string;
  verifyButton: string;
  whatsappTitle: string;
  whatsappSuccess: string;
  whatsappDescription: string;
  whatsappButton: string;
  updateTitle: string;
  updateHeading: string;
  updateWarning: string;
  updateIntro: string;
  updateBullets: string[];
  updateImportant: string;
}> = {
  es: {
    downloadTitle: "Descargar ArepaTool v2.2.4", accessConfirmed: "Acceso confirmado. Tu enlace de descarga directa es privado y vence en 10 minutos.", newVersion: "Nueva versión lista", downloadNow: "Descargar ahora", joinOfficial: "Unirme al grupo oficial", verifyDescription: "Verifica tu usuario o correo para recibir un enlace directo, privado y temporal de descarga.", identifierPlaceholder: "Usuario o correo registrado", verifyButton: "Verificar y continuar", whatsappTitle: "Acceso al Grupo Oficial", whatsappSuccess: "¡Tu correo tiene acceso! Únete al grupo oficial.", whatsappDescription: "Ingresa tu correo registrado para obtener el link del grupo de WhatsApp.", whatsappButton: "Verificar Acceso", updateTitle: "ArepaTool v2.2.4 ya está disponible", updateHeading: "Advertencia — ROM Patch Transsion", updateIntro: "Para equipos Infinix, Tecno e Itel, verifica que la ROM Patch corresponda exactamente al modelo y versión de Android del dispositivo.", updateBullets: ["Existe riesgo de bootloop o brick si el equipo rechaza el firmware o se usa una ROM incompatible.", "Para mayor seguridad, se recomienda contar con una herramienta de flash vía BROM para recuperación si fuese necesaria.", "El soporte puede orientarte si el proceso presenta inconvenientes."], updateImportant: "Importante: ArepaTool no desbloquea el bootloader. El equipo debe tenerlo desbloqueado antes de aplicar cualquier ROM Patch." },
  en: {
    downloadTitle: "Download ArepaTool v2.2.4", accessConfirmed: "Access confirmed. Your direct download link is private and expires in 10 minutes.", newVersion: "New version ready", downloadNow: "Download now", joinOfficial: "Join official group", verifyDescription: "Verify your username or email to receive a private, temporary direct download link.", identifierPlaceholder: "Registered username or email", verifyButton: "Verify and continue", whatsappTitle: "Official group access", whatsappSuccess: "Your email has access. Join the official group.", whatsappDescription: "Enter your registered email to get the WhatsApp group link.", whatsappButton: "Verify access", updateTitle: "ArepaTool v2.2.4 is now available", updateHeading: "Warning — Transsion ROM Patch", updateIntro: "For Infinix, Tecno and Itel devices, verify that the ROM Patch matches the exact model and Android version.", updateBullets: ["Bootloop or brick risk exists if the device rejects the firmware or an incompatible ROM is used.", "For safety, keep a BROM flashing tool available for recovery if needed.", "Support can guide you if the process has issues."], updateImportant: "Important: ArepaTool does not unlock the bootloader. The device must be unlocked before applying any ROM Patch." },
  "pt-br": {
    downloadTitle: "Baixar ArepaTool v2.2.4", accessConfirmed: "Acesso confirmado. Seu link de download direto é privado e expira em 10 minutos.", newVersion: "Nova versão pronta", downloadNow: "Baixar agora", joinOfficial: "Entrar no grupo oficial", verifyDescription: "Verifique seu usuário ou e-mail para receber um link direto, privado e temporário.", identifierPlaceholder: "Usuário ou e-mail cadastrado", verifyButton: "Verificar e continuar", whatsappTitle: "Acesso ao grupo oficial", whatsappSuccess: "Seu e-mail tem acesso. Entre no grupo oficial.", whatsappDescription: "Digite seu e-mail cadastrado para obter o link do grupo do WhatsApp.", whatsappButton: "Verificar acesso", updateTitle: "A ArepaTool v2.2.4 já está disponível", updateHeading: "Aviso — ROM Patch Transsion", updateIntro: "Para aparelhos Infinix, Tecno e Itel, confirme que a ROM Patch corresponde exatamente ao modelo e à versão do Android.", updateBullets: ["Existe risco de bootloop ou brick se o aparelho rejeitar o firmware ou uma ROM incompatível for usada.", "Por segurança, mantenha uma ferramenta de flash via BROM disponível para recuperação, se necessário.", "O suporte pode orientar você caso o processo apresente problemas."], updateImportant: "Importante: a ArepaTool não desbloqueia o bootloader. O aparelho precisa estar desbloqueado antes de aplicar qualquer ROM Patch." },
};

export function getLocaleCopy(locale: Locale) {
  return localeCopy[locale] ?? localeCopy.es;
}

export function getNavLinks(locale: Locale) {
  const nav = getLocaleCopy(locale).nav;
  return [
    { label: nav.home, href: "/" },
    { label: nav.models, href: "/supportedmodels" },
    { label: nav.updates, href: "/updates" },
    { label: nav.features, href: "/features" },
    { label: nav.tutorials, href: "/tutorials" },
    { label: nav.instructions, href: "/instructions" },
    { label: nav.pricing, href: "/pricing" },
    { label: nav.resellers, href: "/resellers" },
  ];
}
