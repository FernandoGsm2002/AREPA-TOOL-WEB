import { API_BASE } from "@/lib/web-session";

export interface WebLoginStep1Result {
  success: boolean;
  error?: string;
  requiresTotp?: boolean;
  loginTicket?: string;
  token?: string;
  userId?: string;
  username?: string;
  email?: string;
  status?: string;
  subscriptionEnd?: string | null;
  dhruOrderId?: string | null;
}

/** Paso 1: usuario + contraseña. Puede devolver el token directo o pedir 2FA. */
export async function webLoginStep1(username: string, password: string): Promise<WebLoginStep1Result> {
  const res = await fetch(`${API_BASE}/api/web-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

/** Paso 2 (solo si el paso 1 pidió 2FA): canjea el ticket + código por el token real. */
export async function webLoginStep2(loginTicket: string, code: string): Promise<WebLoginStep1Result> {
  const res = await fetch(`${API_BASE}/api/web-login-totp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginTicket, code }),
  });
  return res.json();
}
