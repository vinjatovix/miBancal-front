import { isTokenExpired, parseJwtPayload } from './jwt';

export type SessionSyncMessageType =
  | 'SESSION_LOGOUT'
  | 'SESSION_LOGIN'
  | 'SESSION_REFRESH';

export interface BaseSessionSyncMessage {
  readonly eventId: string;
  readonly timestamp: number;
}

export interface SessionSyncLogoutMessage extends BaseSessionSyncMessage {
  readonly type: 'SESSION_LOGOUT';
}

export interface SessionSyncLoginMessage extends BaseSessionSyncMessage {
  readonly type: 'SESSION_LOGIN';
  readonly token: string;
}

export interface SessionSyncRefreshMessage extends BaseSessionSyncMessage {
  readonly type: 'SESSION_REFRESH';
  readonly token: string;
}

export type SessionSyncMessage =
  | SessionSyncLogoutMessage
  | SessionSyncLoginMessage
  | SessionSyncRefreshMessage;

export const SESSION_SYNC_CHANNEL_NAME = 'agro_session_sync';
export const SESSION_SYNC_STORAGE_KEY = 'agro_session_sync';

const MAX_DEDUPLICATION_CACHE_SIZE = 100;
const processedEventIds: string[] = [];
const processedEventIdSet = new Set<string>();

export type SessionSyncListener = (message: SessionSyncMessage) => void;

const activeListeners = new Set<SessionSyncListener>();
let activeChannel: BroadcastChannel | null = null;
let activeStorageHandler: ((event: StorageEvent) => void) | null = null;

export function createBaseSessionSyncMessage(): BaseSessionSyncMessage {
  return {
    eventId: crypto.randomUUID(),
    timestamp: Date.now()
  };
}

export function isDuplicateSessionSyncEvent(eventId: string): boolean {
  return processedEventIdSet.has(eventId);
}

export function recordSessionSyncEvent(eventId: string): void {
  if (processedEventIdSet.has(eventId)) return;
  if (processedEventIds.length >= MAX_DEDUPLICATION_CACHE_SIZE) {
    const oldest = processedEventIds.shift();
    if (oldest) processedEventIdSet.delete(oldest);
  }
  processedEventIds.push(eventId);
  processedEventIdSet.add(eventId);
}

function teardownTransportIfEmpty(): void {
  if (activeListeners.size > 0) return;

  if (activeChannel) {
    activeChannel.onmessage = null;
    activeChannel.close();
    activeChannel = null;
  }

  if (activeStorageHandler && typeof window !== 'undefined') {
    window.removeEventListener('storage', activeStorageHandler);
    activeStorageHandler = null;
  }
}

export function clearSessionSyncCache(): void {
  processedEventIds.length = 0;
  processedEventIdSet.clear();
  activeListeners.clear();
  teardownTransportIfEmpty();
}

function hasValidBaseEnvelope(record: Record<string, unknown>): boolean {
  return (
    typeof record.eventId === 'string' &&
    record.eventId.length > 0 &&
    typeof record.timestamp === 'number' &&
    Number.isFinite(record.timestamp) &&
    record.timestamp > 0
  );
}

function isValidTokenPayload(token: unknown): boolean {
  if (typeof token !== 'string' || token.length === 0) return false;
  const payload = parseJwtPayload(token);
  return Boolean(payload && !isTokenExpired(payload.exp));
}

export function isValidSessionSyncMessage(
  candidate: unknown
): candidate is SessionSyncMessage {
  if (typeof candidate !== 'object' || candidate === null) return false;
  const record = candidate as Record<string, unknown>;
  if (!hasValidBaseEnvelope(record)) return false;
  if (record.type === 'SESSION_LOGOUT') return true;
  if (record.type === 'SESSION_LOGIN' || record.type === 'SESSION_REFRESH') {
    return isValidTokenPayload(record.token);
  }
  return false;
}

function createBroadcastChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  try {
    return new BroadcastChannel(SESSION_SYNC_CHANNEL_NAME);
  } catch {
    return null;
  }
}

function broadcastSessionMessage(message: SessionSyncMessage): void {
  recordSessionSyncEvent(message.eventId);

  const channel = createBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage(message);
    } catch {
      // Ignored on purpose: continue to the localStorage fallback below.
    } finally {
      channel.close();
    }
  }

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SESSION_SYNC_STORAGE_KEY, JSON.stringify(message));
    } catch {
      return;
    }
  }
}

export function broadcastSessionLogout(): void {
  const base = createBaseSessionSyncMessage();
  broadcastSessionMessage({
    type: 'SESSION_LOGOUT',
    eventId: base.eventId,
    timestamp: base.timestamp
  });
}

export function broadcastSessionLogin(token: string): void {
  const base = createBaseSessionSyncMessage();
  broadcastSessionMessage({
    type: 'SESSION_LOGIN',
    eventId: base.eventId,
    timestamp: base.timestamp,
    token
  });
}

export function broadcastSessionRefresh(token: string): void {
  const base = createBaseSessionSyncMessage();
  broadcastSessionMessage({
    type: 'SESSION_REFRESH',
    eventId: base.eventId,
    timestamp: base.timestamp,
    token
  });
}

function dispatchToListeners(message: SessionSyncMessage): void {
  for (const listener of activeListeners) {
    listener(message);
  }
}

function handleIncomingMessage(data: unknown): void {
  if (!isValidSessionSyncMessage(data)) {
    return;
  }
  if (isDuplicateSessionSyncEvent(data.eventId)) {
    return;
  }
  recordSessionSyncEvent(data.eventId);
  dispatchToListeners(data);
}

function ensureTransportSubscribed(): void {
  if (activeListeners.size > 1) {
    return;
  }

  activeChannel = createBroadcastChannel();
  if (activeChannel) {
    activeChannel.onmessage = (event: MessageEvent) => {
      handleIncomingMessage(event.data);
    };
  }

  activeStorageHandler = (event: StorageEvent) => {
    if (event.key !== SESSION_SYNC_STORAGE_KEY || !event.newValue) {
      return;
    }
    try {
      const parsed = JSON.parse(event.newValue);
      handleIncomingMessage(parsed);
    } catch {
      return;
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', activeStorageHandler);
  }
}

export function subscribeToSessionSync(
  listener: SessionSyncListener
): () => void {
  activeListeners.add(listener);
  ensureTransportSubscribed();

  return () => {
    activeListeners.delete(listener);
    teardownTransportIfEmpty();
  };
}
