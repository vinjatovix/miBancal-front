const SESSION_TRANSFER_PREFIX = 'session_transfer_';
const SESSION_TRANSFER_TTL_MS = 60_000;

interface SessionTransferPayload {
  readonly token: string;
  readonly expiresAt: number;
}

export function createSessionTransferTicket(token: string): string {
  try {
    const ticket = crypto.randomUUID();
    const payload: SessionTransferPayload = {
      token,
      expiresAt: Date.now() + SESSION_TRANSFER_TTL_MS
    };
    localStorage.setItem(
      `${SESSION_TRANSFER_PREFIX}${ticket}`,
      JSON.stringify(payload)
    );
    return ticket;
  } catch {
    return '';
  }
}

export function createSessionTransferUrl(
  targetUrl: string,
  token: string
): string {
  const ticket = createSessionTransferTicket(token);
  if (!ticket) return targetUrl;
  return `${targetUrl}#session_transfer=${encodeURIComponent(ticket)}`;
}

export function consumeSessionTransferToken(): string | null {
  if (typeof window === 'undefined' || !window.location.hash) {
    return null;
  }

  const hashContent = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hashContent);
  const ticket = params.get('session_transfer');

  if (!ticket) {
    return null;
  }

  // Sanitize the URL immediately regardless of whether ticket resolves
  params.delete('session_transfer');
  const remaining = params.toString();
  const sanitizedHash = remaining ? `#${remaining}` : '';
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search + sanitizedHash
  );

  try {
    const storageKey = `${SESSION_TRANSFER_PREFIX}${ticket}`;
    const raw = localStorage.getItem(storageKey);
    localStorage.removeItem(storageKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<SessionTransferPayload>;
    if (
      typeof parsed.token !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      Date.now() > parsed.expiresAt
    ) {
      return null;
    }

    return parsed.token;
  } catch {
    return null;
  }
}
