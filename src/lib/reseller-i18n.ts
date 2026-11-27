import type { ResellerLanguage } from "./reseller-api";
// Every UI string has an explicit ES / EN / PT-BR translation. Server messages remain plain text.
const copy = {
  enrollmentApprovalRequired: [
    "Contacta a administración para que apruebe tu acceso con el Telegram vinculado a tu cuenta antes de configurar el autenticador.",
    "Contact an administrator to approve access using the Telegram linked to your account before setting up your authenticator.",
    "Fale com a administração para aprovar seu acesso com o Telegram vinculado à sua conta antes de configurar o autenticador.",
  ],
  loginRecoveryHelp: [
    "¿Olvidaste tu contraseña del panel o perdiste el autenticador? Contacta a administración. También puedes iniciar sesión con un código de recuperación.",
    "Forgot your workspace password or lost your authenticator? Contact an administrator. You can also sign in using a recovery code.",
    "Esqueceu a senha do painel ou perdeu o autenticador? Fale com a administração. Você também pode entrar com um código de recuperação.",
  ],
  reportTimezone: [
    "Fechas de Perú (UTC−5). Máximo 3 años por consulta.",
    "Peru dates (UTC−5). Maximum 3 years per query.",
    "Datas do Peru (UTC−5). Máximo de 3 anos por consulta.",
  ],
  dateRangeLimit: [
    "Selecciona un período de hasta 3 años.",
    "Select a period of up to 3 years.",
    "Selecione um período de até 3 anos.",
  ],
  credentialsSaved: [
    "He guardado las credenciales en un lugar seguro.",
    "I have saved the credentials in a safe place.",
    "Salvei as credenciais em um lugar seguro.",
  ],
  credentialsExpired: [
    "La compra ya está confirmada, pero sus credenciales ya no están disponibles. No vuelvas a comprar: contacta a administración con esta referencia para recuperar el acceso.",
    "The purchase is already confirmed, but its credentials are no longer available. Do not purchase again: contact an administrator with this reference to recover access.",
    "A compra já está confirmada, mas as credenciais não estão mais disponíveis. Não compre novamente: fale com a administração e informe esta referência para recuperar o acesso.",
  ],
  recoverPurchase: [
    "Recuperar operación pendiente",
    "Recover pending operation",
    "Recuperar operação pendente",
  ],
  telegramCode: ["Código de Telegram", "Telegram code", "Código do Telegram"],
  refund: ["Reembolso", "Refund", "Reembolso"],
  workspace: [
    "Área de distribuidores",
    "Reseller workspace",
    "Área de revendedores",
  ],
  overview: ["Resumen", "Overview", "Resumo"],
  orders: ["Comprar", "Orders", "Comprar"],
  analytics: ["Análisis", "Analytics", "Análise"],
  history: ["Movimientos", "History", "Movimentações"],
  receipts: ["Comprobantes", "Receipts", "Comprovantes"],
  api: ["Conexión API", "API connection", "Conexão API"],
  announcements: ["Anuncios", "Announcements", "Avisos"],
  security: ["Seguridad", "Security", "Segurança"],
  overviewIntro: [
    "Tu saldo y actividad, en un solo lugar.",
    "Your balance and activity, in one place.",
    "Seu saldo e sua atividade, em um só lugar.",
  ],
  ordersIntro: [
    "Revisa el destinatario y el importe antes de confirmar.",
    "Review the recipient and amount before confirming.",
    "Revise o destinatário e o valor antes de confirmar.",
  ],
  analyticsIntro: [
    "Detalle de operaciones del período seleccionado.",
    "Operation details for the selected period.",
    "Detalhes das operações no período selecionado.",
  ],
  historyIntro: [
    "Cada movimiento con su saldo anterior y posterior.",
    "Every movement with its opening and closing balance.",
    "Cada movimentação com seu saldo anterior e posterior.",
  ],
  receiptsIntro: [
    "Solo recargas de saldo realizadas por administración.",
    "Only balance top-ups made by an administrator.",
    "Somente recargas de saldo feitas pela administração.",
  ],
  apiIntro: [
    "Controla tus conexiones externas y revisa su actividad.",
    "Control external connections and review their activity.",
    "Controle conexões externas e acompanhe a atividade.",
  ],
  announcementsIntro: [
    "Tarifas, mantenimiento y avisos de resincronización.",
    "Pricing, maintenance and resynchronization notices.",
    "Preços, manutenção e avisos de ressincronização.",
  ],
  securityIntro: [
    "Protege el acceso a tu panel.",
    "Protect access to your workspace.",
    "Proteja o acesso ao seu painel.",
  ],
  loading: ["Cargando…", "Loading…", "Carregando…"],
  saving: ["Guardando…", "Saving…", "Salvando…"],
  retry: ["Reintentar", "Try again", "Tentar novamente"],
  refresh: ["Actualizar", "Refresh", "Atualizar"],
  cancel: ["Cancelar", "Cancel", "Cancelar"],
  close: ["Cerrar", "Close", "Fechar"],
  continue: ["Continuar", "Continue", "Continuar"],
  back: ["Volver", "Back", "Voltar"],
  signOut: ["Cerrar sesión", "Sign out", "Sair"],
  language: ["Idioma", "Language", "Idioma"],
  menu: ["Menú del panel", "Workspace menu", "Menu do painel"],
  skip: ["Ir al contenido", "Skip to content", "Ir para o conteúdo"],
  failed: [
    "No se pudo completar la solicitud. Intenta de nuevo.",
    "The request could not be completed. Try again.",
    "Não foi possível concluir a solicitação. Tente novamente.",
  ],
  network: [
    "No se recibió una respuesta. Comprueba la conexión y vuelve a intentarlo.",
    "No response was received. Check your connection and try again.",
    "Nenhuma resposta foi recebida. Verifique a conexão e tente novamente.",
  ],
  sessionExpired: [
    "Tu sesión terminó. Vuelve a iniciar sesión.",
    "Your session ended. Sign in again.",
    "Sua sessão terminou. Entre novamente.",
  ],
  saved: ["Cambios guardados.", "Changes saved.", "Alterações salvas."],
  empty: [
    "No hay registros para este período.",
    "No records for this period.",
    "Não há registros neste período.",
  ],
  noActivity: [
    "La actividad aparecerá aquí cuando haya operaciones.",
    "Activity will appear here when operations are recorded.",
    "A atividade aparecerá aqui quando houver operações.",
  ],
  login: ["Iniciar sesión", "Sign in", "Entrar"],
  loginIntro: [
    "Administra licencias, créditos y alquileres desde tu cuenta de distribuidor.",
    "Manage licenses, credits and rentals from your reseller account.",
    "Gerencie licenças, créditos e aluguéis na sua conta de revendedor.",
  ],
  loginHelp: [
    "Usa tu cuenta de distribuidor. El acceso requiere verificación en dos pasos.",
    "Use your reseller account. Access requires two-step verification.",
    "Use sua conta de revendedor. O acesso exige verificação em duas etapas.",
  ],
  username: ["Usuario", "Username", "Usuário"],
  password: ["Contraseña", "Password", "Senha"],
  showPassword: ["Mostrar contraseña", "Show password", "Mostrar senha"],
  hidePassword: ["Ocultar contraseña", "Hide password", "Ocultar senha"],
  home: ["Volver a ArepaTool", "Back to ArepaTool", "Voltar ao ArepaTool"],
  verify: ["Verificar acceso", "Verify access", "Verificar acesso"],
  totpTitle: [
    "Verifica que eres tú",
    "Verify it’s you",
    "Confirme sua identidade",
  ],
  totpHelp: [
    "Escribe el código de tu autenticador o uno de tus códigos de recuperación.",
    "Enter your authenticator code or one of your recovery codes.",
    "Digite o código do autenticador ou um dos códigos de recuperação.",
  ],
  code: [
    "Código de verificación",
    "Verification code",
    "Código de verificação",
  ],
  telegramTitle: [
    "Revisa tu Telegram",
    "Check your Telegram",
    "Confira seu Telegram",
  ],
  telegramHelp: [
    "Enviamos un código al Telegram que ya está vinculado a tu cuenta.",
    "We sent a code to the Telegram already linked to your account.",
    "Enviamos um código ao Telegram já vinculado à sua conta.",
  ],
  setupTitle: [
    "Conecta tu autenticador",
    "Connect your authenticator",
    "Conecte seu autenticador",
  ],
  setupHelp: [
    "Escanea el QR con tu aplicación de autenticación o introduce la clave manualmente. Después escribe su código de 6 dígitos.",
    "Scan the QR in your authenticator app or enter the setup key manually. Then enter its 6-digit code.",
    "Leia o QR no aplicativo autenticador ou digite a chave manualmente. Depois informe o código de 6 dígitos.",
  ],
  setupKey: ["Clave de configuración", "Setup key", "Chave de configuração"],
  qrAlt: [
    "QR para configurar la autenticación en dos pasos",
    "QR for two-step authentication setup",
    "QR para configurar a autenticação em duas etapas",
  ],
  qrFailed: [
    "No se pudo generar el QR. Usa la clave manual.",
    "Could not generate the QR. Use the manual key.",
    "Não foi possível gerar o QR. Use a chave manual.",
  ],
  recoveryTitle: [
    "Guarda tus códigos de recuperación",
    "Save your recovery codes",
    "Salve seus códigos de recuperação",
  ],
  recoveryHelp: [
    "Cada código sirve una sola vez. Guárdalos en un lugar privado antes de continuar.",
    "Each code works once. Keep them in a private place before continuing.",
    "Cada código funciona uma vez. Guarde-os em um local privado antes de continuar.",
  ],
  recoverySaved: [
    "He guardado mis códigos en un lugar seguro.",
    "I have saved my codes in a safe place.",
    "Salvei meus códigos em um lugar seguro.",
  ],
  enterWorkspace: ["Entrar al panel", "Enter workspace", "Entrar no painel"],
  copy: ["Copiar", "Copy", "Copiar"],
  copied: ["Copiado.", "Copied.", "Copiado."],
  copyFailed: [
    "No se pudo copiar. Selecciona y copia el texto manualmente.",
    "Could not copy. Select and copy the text manually.",
    "Não foi possível copiar. Selecione e copie o texto manualmente.",
  ],
  download: ["Descargar", "Download", "Baixar"],
  print: ["Imprimir", "Print", "Imprimir"],
  balance: ["Saldo disponible", "Available balance", "Saldo disponível"],
  balanceHelp: [
    "Saldo para tus próximas operaciones.",
    "Balance for your next operations.",
    "Saldo para suas próximas operações.",
  ],
  newOrder: ["Nueva compra", "New order", "Nova compra"],
  lowBalance: [
    "Tu saldo alcanzó el umbral de aviso configurado.",
    "Your balance has reached your configured alert threshold.",
    "Seu saldo atingiu o limite de aviso configurado.",
  ],
  topupHelp: [
    "Para agregar saldo, contacta a administración.",
    "To add balance, contact an administrator.",
    "Para adicionar saldo, fale com a administração.",
  ],
  licenses: ["Licencias", "Licenses", "Licenças"],
  credits: ["Créditos", "Credits", "Créditos"],
  rentals: ["Alquileres", "Rentals", "Aluguéis"],
  spent: ["Total utilizado", "Total spent", "Total utilizado"],
  topups: ["Saldo agregado", "Balance added", "Saldo adicionado"],
  currentPrices: [
    "Tus tarifas actuales",
    "Your current rates",
    "Seus preços atuais",
  ],
  months: ["meses", "months", "meses"],
  creditUnit: ["Por crédito", "Per credit", "Por crédito"],
  rentalUnit: ["Por alquiler", "Per rental", "Por aluguel"],
  allTime: ["Todo el historial", "All time", "Todo o histórico"],
  from: ["Desde", "From", "De"],
  to: ["Hasta", "To", "Até"],
  apply: ["Aplicar", "Apply", "Aplicar"],
  invalidDates: [
    "La fecha final debe ser igual o posterior a la inicial.",
    "The end date must be on or after the start date.",
    "A data final deve ser igual ou posterior à inicial.",
  ],
  kind: ["Producto", "Product", "Produto"],
  license: ["Licencia", "License", "Licença"],
  rental: ["Alquiler", "Rental", "Aluguel"],
  duration: ["Duración", "Duration", "Duração"],
  activation: ["Activación", "Activation", "Ativação"],
  extension: ["Extensión", "Extension", "Extensão"],
  operation: ["Operación", "Operation", "Operação"],
  identifier: [
    "Usuario o correo del cliente",
    "Customer username or email",
    "Usuário ou e-mail do cliente",
  ],
  quantity: ["Cantidad", "Quantity", "Quantidade"],
  rentalHelp: [
    "Se generarán cuentas de alquiler. Guarda sus credenciales al completar la compra.",
    "Rental accounts will be generated. Save their credentials when the purchase completes.",
    "Contas de aluguel serão geradas. Salve as credenciais ao concluir a compra.",
  ],
  quote: ["Revisar compra", "Review order", "Revisar compra"],
  review: [
    "Confirma los detalles",
    "Confirm the details",
    "Confirme os detalhes",
  ],
  customer: ["Cliente", "Customer", "Cliente"],
  unitPrice: ["Precio unitario", "Unit price", "Preço unitário"],
  total: ["Total", "Total", "Total"],
  before: ["Saldo anterior", "Balance before", "Saldo anterior"],
  after: ["Saldo posterior", "Balance after", "Saldo posterior"],
  quoteUntil: [
    "Cotización válida hasta",
    "Quote valid until",
    "Cotação válida até",
  ],
  confirm: ["Confirmar compra", "Confirm purchase", "Confirmar compra"],
  confirming: ["Confirmando…", "Confirming…", "Confirmando…"],
  quoteExpired: [
    "La cotización venció. Vuelve a revisar la compra.",
    "The quote expired. Review the order again.",
    "A cotação expirou. Revise a compra novamente.",
  ],
  insufficient: [
    "Saldo insuficiente para esta compra.",
    "Insufficient balance for this purchase.",
    "Saldo insuficiente para esta compra.",
  ],
  purchaseUncertain: [
    "No pudimos confirmar el resultado. Reintenta esta misma operación para recuperar su resultado sin generar otra compra. No cierres esta página.",
    "We could not confirm the result. Retry this same operation to recover its result without creating another purchase. Keep this page open.",
    "Não foi possível confirmar o resultado. Tente esta mesma operação novamente para recuperar o resultado sem criar outra compra. Mantenha esta página aberta.",
  ],
  retryPurchase: [
    "Reintentar la misma operación",
    "Retry the same operation",
    "Tentar a mesma operação novamente",
  ],
  orderDone: ["Compra completada", "Purchase completed", "Compra concluída"],
  reference: ["Referencia", "Reference", "Referência"],
  accounts: ["Cuentas generadas", "Generated accounts", "Contas geradas"],
  credentialsHelp: [
    "Guarda estas credenciales ahora. No se almacenan en este navegador.",
    "Save these credentials now. They are not stored in this browser.",
    "Salve estas credenciais agora. Elas não são armazenadas neste navegador.",
  ],
  email: ["Correo", "Email", "E-mail"],
  date: ["Fecha", "Date", "Data"],
  type: ["Tipo", "Type", "Tipo"],
  amount: ["Importe", "Amount", "Valor"],
  description: ["Descripción", "Description", "Descrição"],
  source: ["Origen", "Source", "Origem"],
  all: ["Todos", "All", "Todos"],
  credit: ["Recarga de saldo", "Balance top-up", "Recarga de saldo"],
  debit: ["Consumo de saldo", "Balance debit", "Consumo de saldo"],
  adjustment: ["Ajuste", "Adjustment", "Ajuste"],
  previous: ["Anterior", "Previous", "Anterior"],
  next: ["Siguiente", "Next", "Próxima"],
  page: ["Página", "Page", "Página"],
  of: ["de", "of", "de"],
  viewReceipt: ["Ver comprobante", "View receipt", "Ver comprovante"],
  receipt: [
    "Comprobante de recarga",
    "Balance top-up receipt",
    "Comprovante de recarga",
  ],
  receiptDisclaimer: [
    "Registro de saldo agregado por administración. No es una factura fiscal ni un comprobante de compra de licencia.",
    "Record of balance added by an administrator. This is not a tax invoice or a license purchase receipt.",
    "Registro de saldo adicionado pela administração. Não é nota fiscal nem comprovante de compra de licença.",
  ],
  receiptInvalid: [
    "Este movimiento no corresponde a una recarga de saldo.",
    "This movement is not a balance top-up.",
    "Esta movimentação não é uma recarga de saldo.",
  ],
  byDay: ["Actividad por día", "Activity by day", "Atividade por dia"],
  byPlan: ["Licencias por plan", "Licenses by plan", "Licenças por plano"],
  bySource: [
    "Operaciones por origen",
    "Operations by source",
    "Operações por origem",
  ],
  count: ["Operaciones", "Operations", "Operações"],
  apiActive: ["API activa", "API active", "API ativa"],
  apiPaused: ["API pausada", "API paused", "API pausada"],
  pauseHelp: [
    "La pausa afecta a las conexiones API externas. Tu sesión del panel sigue disponible; no suspende tu cuenta.",
    "Pausing affects external API connections. Your workspace session stays available; it does not suspend your account.",
    "A pausa afeta as conexões API externas. Sua sessão do painel continua disponível; sua conta não é suspensa.",
  ],
  pause: ["Pausar API", "Pause API", "Pausar API"],
  resume: ["Reactivar API", "Resume API", "Reativar API"],
  endpoint: ["Dirección API", "API address", "Endereço API"],
  lastUsed: ["Último uso", "Last used", "Último uso"],
  never: [
    "Sin actividad registrada",
    "No recorded activity",
    "Sem atividade registrada",
  ],
  revealKey: ["Mostrar clave API", "Reveal API key", "Mostrar chave API"],
  rotateKey: ["Rotar clave API", "Rotate API key", "Trocar chave API"],
  rotateWarning: [
    "La clave Dhru anterior dejará de funcionar de inmediato. También cambiará la clave usada para iniciar sesión por API. Actualiza tus integraciones.",
    "The old Dhru key will stop working immediately. The API login key will also change. Update your integrations.",
    "A chave Dhru antiga deixará de funcionar imediatamente. A chave de login pela API também mudará. Atualize suas integrações.",
  ],
  acknowledgeRotation: [
    "Entiendo que debo actualizar mis integraciones.",
    "I understand that I must update my integrations.",
    "Entendo que preciso atualizar minhas integrações.",
  ],
  apiKey: ["Clave API", "API key", "Chave API"],
  hideSecret: ["Ocultar", "Hide", "Ocultar"],
  recentActivity: [
    "Actividad reciente",
    "Recent activity",
    "Atividade recente",
  ],
  success: ["Correcto", "Successful", "Sucesso"],
  error: ["Error", "Error", "Erro"],
  result: ["Resultado", "Result", "Resultado"],
  action: ["Acción", "Action", "Ação"],
  status: ["Estado", "Status", "Status"],
  ip: ["Dirección IP", "IP address", "Endereço IP"],
  pinned: ["Destacado", "Pinned", "Destaque"],
  noAnnouncements: [
    "No hay anuncios por ahora.",
    "No announcements yet.",
    "Ainda não há avisos.",
  ],
  twoFactor: [
    "Verificación en dos pasos",
    "Two-step verification",
    "Verificação em duas etapas",
  ],
  enabled: ["Activada", "Enabled", "Ativada"],
  authenticatorCode: [
    "Código del autenticador",
    "Authenticator code",
    "Código do autenticador",
  ],
  sensitiveHelp: [
    "Cada código del autenticador se puede usar una sola vez. Si acabas de iniciar sesión o confirmar otra acción, espera al siguiente código (hasta 30 segundos).",
    "Each authenticator code can be used only once. If you just signed in or confirmed another action, wait for the next code (up to 30 seconds).",
    "Cada código do autenticador só pode ser usado uma vez. Se acabou de entrar ou confirmar outra ação, aguarde o próximo código (até 30 segundos).",
  ],
  sessions: ["Sesiones del panel", "Workspace sessions", "Sessões do painel"],
  currentSession: ["Esta sesión", "This session", "Esta sessão"],
  lastSeen: ["Última actividad", "Last activity", "Última atividade"],
  created: ["Creada", "Created", "Criada"],
  revoke: ["Cerrar esta sesión", "Revoke session", "Encerrar esta sessão"],
  passwordTitle: [
    "Contraseña del panel",
    "Workspace password",
    "Senha do painel",
  ],
  passwordHelp: [
    "Esta contraseña solo protege el panel. Es independiente de tu clave API.",
    "This password only protects the workspace. It is independent of your API key.",
    "Esta senha protege apenas o painel. É independente da chave API.",
  ],
  newPassword: ["Nueva contraseña", "New password", "Nova senha"],
  confirmPassword: [
    "Confirmar contraseña",
    "Confirm password",
    "Confirmar senha",
  ],
  passwordMismatch: [
    "Las contraseñas no coinciden.",
    "Passwords do not match.",
    "As senhas não coincidem.",
  ],
  passwordLength: [
    "Usa entre 12 y 72 bytes, con una mayúscula y un número. Los caracteres especiales pueden ocupar varios bytes.",
    "Use 12–72 bytes, including an uppercase letter and a number. Special characters may use multiple bytes.",
    "Use entre 12 e 72 bytes, incluindo uma letra maiúscula e um número. Caracteres especiais podem ocupar vários bytes.",
  ],
  changePassword: ["Guardar contraseña", "Save password", "Salvar senha"],
  recovery: [
    "Códigos de recuperación",
    "Recovery codes",
    "Códigos de recuperação",
  ],
  recoveryWarning: [
    "Al generar nuevos códigos, los anteriores dejarán de funcionar.",
    "Generating new codes invalidates all previous codes.",
    "Gerar novos códigos invalida todos os códigos anteriores.",
  ],
  generateCodes: [
    "Generar nuevos códigos",
    "Generate new codes",
    "Gerar novos códigos",
  ],
  preferences: ["Preferencias", "Preferences", "Preferências"],
  threshold: [
    "Aviso de saldo bajo (USD)",
    "Low balance alert (USD)",
    "Aviso de saldo baixo (USD)",
  ],
  thresholdHelp: [
    "El panel muestra un aviso cuando tu saldo es igual o menor que este importe.",
    "The workspace shows an alert when your balance is at or below this amount.",
    "O painel mostra um aviso quando seu saldo é igual ou menor que este valor.",
  ],
  save: ["Guardar", "Save", "Salvar"],
  invalidAmount: [
    "Introduce un importe válido igual o mayor que cero.",
    "Enter a valid amount of zero or more.",
    "Informe um valor válido igual ou maior que zero.",
  ],
} as const;
export type MessageKey = keyof typeof copy;
export type Translator = (key: MessageKey) => string;
export function translator(language: ResellerLanguage): Translator {
  const index = language === "en" ? 1 : language === "pt-br" ? 2 : 0;
  return (key) => copy[key][index];
}
export function normalizeLanguage(value: unknown): ResellerLanguage {
  return typeof value === "string" && value.startsWith("en")
    ? "en"
    : typeof value === "string" && value.startsWith("pt")
      ? "pt-br"
      : "es";
}
export const locales = { es: "es-PE", en: "en-US", "pt-br": "pt-BR" };
export function money(value: unknown, language: ResellerLanguage) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(Number(value))
  )
    return "—";
  return new Intl.NumberFormat(locales[language], {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}
export function dateTime(
  value: string | null | undefined,
  language: ResellerLanguage,
) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(locales[language], {
        dateStyle: "medium",
        ...(value.length > 10
          ? { timeStyle: "short" as const, timeZone: "America/Lima" }
          : {}),
      }).format(date);
}
