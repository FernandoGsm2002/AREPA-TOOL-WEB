// Only the opaque idempotency identifier is persisted. No account data, credentials or tokens.
const memory = new Map<string, string>();
const key = (resellerId: string) =>
  `arepatool:reseller:pending-order:${resellerId}`;
export function readPendingOrder(resellerId: string): string | undefined {
  try {
    return sessionStorage.getItem(key(resellerId)) || memory.get(resellerId);
  } catch {
    return memory.get(resellerId);
  }
}
export function rememberPendingOrder(resellerId: string, quoteId: string) {
  memory.set(resellerId, quoteId);
  try {
    sessionStorage.setItem(key(resellerId), quoteId);
  } catch {
    /* Memory retry remains available when storage is disabled. */
  }
}
export function forgetPendingOrder(resellerId: string) {
  memory.delete(resellerId);
  try {
    sessionStorage.removeItem(key(resellerId));
  } catch {
    /* No credentials were stored. */
  }
}
