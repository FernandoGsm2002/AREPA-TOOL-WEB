/** Reseller session and secrets are deliberately memory-only; cookies are server-owned. */
export type ResellerLanguage = "es" | "en" | "pt-br";
export type Money = number | string;
export interface Reseller {
  id: string;
  username: string;
  name: string;
  email: string;
  balance: Money;
  apiPaused: boolean;
  hasPanelPassword?: boolean;
  language: ResellerLanguage;
  lowBalanceThreshold?: Money | null;
  prices: { 3: Money; 6: Money; 12: Money; credit: Money; rental: Money };
}
export interface LedgerItem {
  id: string;
  type: string;
  amount: Money;
  balanceBefore: Money;
  balanceAfter: Money;
  description: string;
  reference: string;
  createdAt: string;
  source: string;
}
export interface TopupReceipt extends Omit<LedgerItem, "type"> {
  reseller: string;
  currency: "USD";
}
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
export interface Overview {
  summary: {
    licenses: number;
    credits: number;
    rentals: number;
    spent: Money;
    topups: Money;
  };
  series: {
    day: string;
    amount: Money;
    licenses: number;
    credits: number;
    rentals: number;
  }[];
  plans: { months: number; count: number; amount: Money }[];
  sources: { source: string; count: number; amount: Money }[];
}
export interface QuoteInput {
  kind: "license" | "credits" | "rental";
  months?: 3 | 6 | 12;
  mode?: "activation" | "extension";
  identifier?: string;
  quantity: number;
}
export interface Quote {
  quoteId: string;
  kind: QuoteInput["kind"];
  unitPrice: Money;
  total: Money;
  balanceBefore: Money;
  balanceAfter: Money;
  customer?: { username: string; email: string };
  quantity: number;
  months?: number;
  expiresAt: string;
}
export interface Order {
  referenceId: string;
  balanceBefore: Money;
  balanceAfter: Money;
  total: Money;
  credentialsExpired?: boolean;
  replayed?: boolean;
  accounts?: { username: string; email: string; password: string }[];
}
export interface ApiStatus {
  api: {
    paused: boolean;
    url: string;
    username: string;
    lastUsedAt: string | null;
  };
  activity: {
    action: string;
    success: boolean;
    httpStatus: number;
    error?: string;
    ip: string;
    createdAt: string;
  }[];
}
export interface Session {
  id: string;
  ip: string;
  userAgent: string;
  lastSeenAt: string;
  createdAt: string;
  current: boolean;
}
export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  pinned: boolean;
}
export interface AuthResult {
  csrfToken: string;
  reseller: Reseller;
  recoveryCodes?: string[];
}
interface Contract {
  login: [
    { username: string; password: string },
    { step: "totp" | "enrollment"; challenge: string },
  ];
  "enroll/verify": [
    { challenge: string; code: string },
    { secret: string; otpAuthUri: string },
  ];
  "enroll/confirm": [{ challenge: string; code: string }, AuthResult];
  verify: [{ challenge: string; code: string }, AuthResult];
  me: [Record<string, never>, AuthResult & { totpEnabled: boolean }];
  logout: [Record<string, never>, Record<string, never>];
  overview: [{ from?: string; to?: string }, Overview];
  history: [
    { page: number; from?: string; to?: string; type?: string },
    PageResult<LedgerItem>,
  ];
  receipts: [{ page: number }, PageResult<LedgerItem>];
  receipt: [{ id: string }, { receipt: TopupReceipt }];
  quote: [QuoteInput, { quote: Quote }];
  confirm: [{ quoteId: string }, { order: Order }];
  "api/status": [Record<string, never>, ApiStatus];
  "api/pause": [{ paused: boolean; code: string }, { api?: ApiStatus["api"] }];
  "api/key": [{ code: string }, { apiKey: string }];
  "api/rotate": [{ code: string }, { apiKey: string }];
  announcements: [Record<string, never>, { items: Announcement[] }];
  sessions: [Record<string, never>, { items: Session[] }];
  "sessions/revoke": [{ id: string; code: string }, Record<string, never>];
  password: [{ password: string; code: string }, Record<string, never>];
  "recovery-codes": [{ code: string }, { recoveryCodes: string[] }];
  preferences: [
    { language?: ResellerLanguage; lowBalanceThreshold?: number | null },
    { reseller?: Reseller },
  ];
}
export class ResellerApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 0,
    public uncertain = false,
  ) {
    super(message);
    this.name = "ResellerApiError";
  }
}
export const RESELLER_API_BASE = "https://api2.arepatool.com/api/reseller";
let csrfToken: string | null = null;
const publicPaths = new Set([
  "login",
  "verify",
  "enroll/verify",
  "enroll/confirm",
  "me",
]);
export function clearResellerSession() {
  csrfToken = null;
}
/** Never retries a POST automatically, especially purchases or key rotations. */
export async function resellerApi<P extends keyof Contract>(
  path: P,
  payload: Contract[P][0],
): Promise<Contract[P][1]> {
  if (!publicPaths.has(path) && !csrfToken)
    throw new ResellerApiError("", "SESSION_REQUIRED", 401);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`${RESELLER_API_BASE}/${path}`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(!publicPaths.has(path) && csrfToken
          ? { "X-Reseller-CSRF": csrfToken }
          : {}),
      },
      body: JSON.stringify(payload),
    });
    let data: Record<string, unknown>;
    try {
      data = await response.json();
    } catch {
      throw new ResellerApiError("", "INVALID_RESPONSE", response.status, true);
    }
    if (!response.ok || data.success !== true) {
      if (
        response.status === 401 &&
        !publicPaths.has(path) &&
        [
          "SESSION_EXPIRED",
          "SESSION_REQUIRED",
          "UNAUTHORIZED",
          "INVALID_SESSION",
        ].includes(String(data.code))
      ) {
        clearResellerSession();
        if (typeof window !== "undefined")
          window.dispatchEvent(new Event("reseller:session-expired"));
      }
      throw new ResellerApiError(
        typeof data.error === "string" ? data.error : "",
        typeof data.code === "string" ? data.code : "REQUEST_FAILED",
        response.status,
        response.status >= 500,
      );
    }
    if (typeof data.csrfToken === "string") csrfToken = data.csrfToken;
    if (path === "logout") clearResellerSession();
    return data as Contract[P][1];
  } catch (error) {
    if (error instanceof ResellerApiError) throw error;
    throw new ResellerApiError(
      "",
      controller.signal.aborted ? "TIMEOUT" : "NETWORK_ERROR",
      0,
      true,
    );
  } finally {
    clearTimeout(timeout);
  }
}
