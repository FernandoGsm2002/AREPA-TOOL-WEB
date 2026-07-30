export const API_BASE = "https://api2.arepatool.com";
const STORAGE_KEY = "arepa_web_session";

export interface WebUser {
  userId: string;
  username: string;
  email: string;
  status: string;
  subscriptionEnd: string | null;
  dhruOrderId: string | null;
}

export interface WebSession {
  token: string;
  user: WebUser;
}

export function saveSession(session: WebSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): WebSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WebSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

/** fetch autenticado contra arepa-api; limpia la sesión y devuelve null en 401. */
export async function webApiFetch(path: string, body: Record<string, unknown> = {}) {
  const session = loadSession();
  if (!session) return null;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    clearSession();
    return null;
  }

  return res.json();
}
