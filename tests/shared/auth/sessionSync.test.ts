import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  broadcastSessionLogin,
  broadcastSessionLogout,
  broadcastSessionRefresh,
  clearSessionSyncCache,
  createBaseSessionSyncMessage,
  isDuplicateSessionSyncEvent,
  isValidSessionSyncMessage,
  recordSessionSyncEvent,
  subscribeToSessionSync
} from '../../../src/shared/auth/sessionSync';
import {
  EXPIRED_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('sessionSync foundational infrastructure', () => {
  beforeEach(() => {
    clearSessionSyncCache();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearSessionSyncCache();
    localStorage.clear();
  });

  describe('base message creation', () => {
    it('generates a valid UUID v4 eventId', () => {
      const baseMessage = createBaseSessionSyncMessage();

      expect(baseMessage.eventId).toMatch(UUID_V4_REGEX);
    });

    it('generates a current unix timestamp in milliseconds', () => {
      const beforeTime = Date.now();
      const baseMessage = createBaseSessionSyncMessage();
      const afterTime = Date.now();

      expect(baseMessage.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(baseMessage.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('generates unique eventId on consecutive calls', () => {
      const firstMessage = createBaseSessionSyncMessage();
      const secondMessage = createBaseSessionSyncMessage();

      expect(firstMessage.eventId).not.toBe(secondMessage.eventId);
    });
  });

  describe('message validation', () => {
    it('accepts a valid logout message', () => {
      const message = {
        type: 'SESSION_LOGOUT' as const,
        eventId: '00000000-0000-4000-8000-000000000001',
        timestamp: Date.now()
      };

      const result = isValidSessionSyncMessage(message);

      expect(result).toBe(true);
    });

    it('accepts a valid login message with unexpired jwt', () => {
      const message = {
        type: 'SESSION_LOGIN' as const,
        eventId: '00000000-0000-4000-8000-000000000002',
        timestamp: Date.now(),
        token: VALID_TEST_TOKEN
      };

      const result = isValidSessionSyncMessage(message);

      expect(result).toBe(true);
    });

    it('accepts a valid refresh message with unexpired jwt', () => {
      const message = {
        type: 'SESSION_REFRESH' as const,
        eventId: '00000000-0000-4000-8000-000000000003',
        timestamp: Date.now(),
        token: VALID_TEST_TOKEN
      };

      const result = isValidSessionSyncMessage(message);

      expect(result).toBe(true);
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['string', 'not-an-object'],
      ['number', 12345],
      ['empty object', {}],
      ['missing eventId', { type: 'SESSION_LOGOUT', timestamp: Date.now() }],
      [
        'invalid eventId type',
        { type: 'SESSION_LOGOUT', eventId: 123, timestamp: Date.now() }
      ],
      [
        'empty eventId',
        { type: 'SESSION_LOGOUT', eventId: '', timestamp: Date.now() }
      ],
      [
        'missing timestamp',
        {
          type: 'SESSION_LOGOUT',
          eventId: '00000000-0000-4000-8000-000000000001'
        }
      ],
      [
        'non-number timestamp',
        {
          type: 'SESSION_LOGOUT',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: 'invalid'
        }
      ],
      [
        'negative timestamp',
        {
          type: 'SESSION_LOGOUT',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: -1
        }
      ],
      [
        'infinity timestamp',
        {
          type: 'SESSION_LOGOUT',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: Infinity
        }
      ],
      [
        'unknown type',
        {
          type: 'UNKNOWN_TYPE',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: Date.now()
        }
      ],
      [
        'login without token',
        {
          type: 'SESSION_LOGIN',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: Date.now()
        }
      ],
      [
        'login with empty token',
        {
          type: 'SESSION_LOGIN',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: Date.now(),
          token: ''
        }
      ],
      [
        'login with non-jwt token',
        {
          type: 'SESSION_LOGIN',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: Date.now(),
          token: 'invalid-token'
        }
      ],
      [
        'login with expired token',
        {
          type: 'SESSION_LOGIN',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: Date.now(),
          token: EXPIRED_TEST_TOKEN
        }
      ],
      [
        'refresh without token',
        {
          type: 'SESSION_REFRESH',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: Date.now()
        }
      ],
      [
        'refresh with expired token',
        {
          type: 'SESSION_REFRESH',
          eventId: '00000000-0000-4000-8000-000000000001',
          timestamp: Date.now(),
          token: EXPIRED_TEST_TOKEN
        }
      ]
    ])('rejects invalid message structure: %s', (_, candidate) => {
      const result = isValidSessionSyncMessage(candidate);

      expect(result).toBe(false);
    });
  });

  describe('deduplication cache', () => {
    it('returns false for unseen eventId', () => {
      const isDuplicate = isDuplicateSessionSyncEvent(
        '00000000-0000-4000-8000-000000000010'
      );

      expect(isDuplicate).toBe(false);
    });

    it('returns true after recording an eventId', () => {
      const eventId = '00000000-0000-4000-8000-000000000011';
      recordSessionSyncEvent(eventId);

      const isDuplicate = isDuplicateSessionSyncEvent(eventId);

      expect(isDuplicate).toBe(true);
    });

    it('resets recorded events when cache is cleared', () => {
      const eventId = '00000000-0000-4000-8000-000000000012';
      recordSessionSyncEvent(eventId);

      clearSessionSyncCache();
      const isDuplicate = isDuplicateSessionSyncEvent(eventId);

      expect(isDuplicate).toBe(false);
    });
  });

  describe('subscribeToSessionSync transport and deduplication', () => {
    it('delivers messages from BroadcastChannel to subscriber', async () => {
      const listener = vi.fn();
      const unsubscribe = subscribeToSessionSync(listener);
      const channel = new BroadcastChannel('agro_session_sync');
      const message = {
        type: 'SESSION_LOGOUT' as const,
        eventId: '00000000-0000-4000-8000-000000000020',
        timestamp: Date.now()
      };

      channel.postMessage(message);
      await vi.waitFor(() => {
        expect(listener).toHaveBeenCalledWith(message);
      });
      unsubscribe();
      channel.close();
    });

    it('delivers messages from storage event fallback to subscriber', async () => {
      const listener = vi.fn();
      const unsubscribe = subscribeToSessionSync(listener);
      const message = {
        type: 'SESSION_LOGOUT' as const,
        eventId: '00000000-0000-4000-8000-000000000021',
        timestamp: Date.now()
      };

      const storageEvent = new StorageEvent('storage', {
        key: 'agro_session_sync',
        newValue: JSON.stringify(message)
      });
      window.dispatchEvent(storageEvent);

      await vi.waitFor(() => {
        expect(listener).toHaveBeenCalledWith(message);
      });
      unsubscribe();
    });

    it('deduplicates messages received from both BroadcastChannel and storage event', async () => {
      const listener = vi.fn();
      const unsubscribe = subscribeToSessionSync(listener);
      const message = {
        type: 'SESSION_LOGOUT' as const,
        eventId: '00000000-0000-4000-8000-000000000022',
        timestamp: Date.now()
      };
      const channel = new BroadcastChannel('agro_session_sync');

      channel.postMessage(message);
      const storageEvent = new StorageEvent('storage', {
        key: 'agro_session_sync',
        newValue: JSON.stringify(message)
      });
      window.dispatchEvent(storageEvent);

      await vi.waitFor(() => {
        expect(listener).toHaveBeenCalledTimes(1);
      });
      expect(listener).toHaveBeenCalledWith(message);
      unsubscribe();
      channel.close();
    });

    it('stops receiving messages after unsubscribe is called', async () => {
      const listener = vi.fn();
      const unsubscribe = subscribeToSessionSync(listener);
      const message = {
        type: 'SESSION_LOGOUT' as const,
        eventId: '00000000-0000-4000-8000-000000000023',
        timestamp: Date.now()
      };

      unsubscribe();

      const storageEvent = new StorageEvent('storage', {
        key: 'agro_session_sync',
        newValue: JSON.stringify(message)
      });
      window.dispatchEvent(storageEvent);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(listener).not.toHaveBeenCalled();
    });

    it('delivers messages to multiple concurrent subscribers without starvation', async () => {
      const firstListener = vi.fn();
      const secondListener = vi.fn();
      const unsubscribeFirst = subscribeToSessionSync(firstListener);
      const unsubscribeSecond = subscribeToSessionSync(secondListener);
      const channel = new BroadcastChannel('agro_session_sync');
      const message = {
        type: 'SESSION_LOGOUT' as const,
        eventId: '00000000-0000-4000-8000-000000000024',
        timestamp: Date.now()
      };

      channel.postMessage(message);

      await vi.waitFor(() => {
        expect(firstListener).toHaveBeenCalledWith(message);
        expect(secondListener).toHaveBeenCalledWith(message);
      });
      unsubscribeFirst();
      unsubscribeSecond();
      channel.close();
    });
  });

  describe('broadcastSessionLogout', () => {
    it('emits a valid SESSION_LOGOUT message over BroadcastChannel and storage', async () => {
      const channel = new BroadcastChannel('agro_session_sync');
      const received: unknown[] = [];
      channel.onmessage = (event) => {
        received.push(event.data);
      };

      broadcastSessionLogout();

      await vi.waitFor(() => {
        expect(received).toHaveLength(1);
      });
      const message = received[0] as Record<string, unknown>;
      expect(message.type).toBe('SESSION_LOGOUT');
      expect(message.eventId).toMatch(UUID_V4_REGEX);
      expect(typeof message.timestamp).toBe('number');
      const stored = localStorage.getItem('agro_session_sync');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored ?? '{}');
      expect(parsed.type).toBe('SESSION_LOGOUT');
      channel.close();
    });

    it('enforces sender isolation so local subscriber does not receive its own emitted logout', async () => {
      const listener = vi.fn();
      const unsubscribe = subscribeToSessionSync(listener);

      broadcastSessionLogout();

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(listener).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('executes localStorage fallback even when BroadcastChannel postMessage throws', () => {
      vi.spyOn(BroadcastChannel.prototype, 'postMessage').mockImplementation(
        () => {
          throw new Error('BroadcastChannel transport failure');
        }
      );

      broadcastSessionLogout();

      const stored = localStorage.getItem('agro_session_sync');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored ?? '{}');
      expect(parsed.type).toBe('SESSION_LOGOUT');
    });
  });

  describe('broadcastSessionLogin', () => {
    it('emits a valid SESSION_LOGIN message with token over BroadcastChannel and storage', async () => {
      const channel = new BroadcastChannel('agro_session_sync');
      const received: unknown[] = [];
      channel.onmessage = (event) => {
        received.push(event.data);
      };

      broadcastSessionLogin(VALID_TEST_TOKEN);

      await vi.waitFor(() => {
        expect(received).toHaveLength(1);
      });
      const message = received[0] as Record<string, unknown>;
      expect(message.type).toBe('SESSION_LOGIN');
      expect(message.eventId).toMatch(UUID_V4_REGEX);
      expect(message.token).toBe(VALID_TEST_TOKEN);
      const stored = localStorage.getItem('agro_session_sync');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored ?? '{}');
      expect(parsed.type).toBe('SESSION_LOGIN');
      expect(parsed.token).toBe(VALID_TEST_TOKEN);
      channel.close();
    });

    it('enforces sender isolation so local subscriber does not receive its own emitted login', async () => {
      const listener = vi.fn();
      const unsubscribe = subscribeToSessionSync(listener);

      broadcastSessionLogin(VALID_TEST_TOKEN);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(listener).not.toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe('broadcastSessionRefresh', () => {
    it('emits a valid SESSION_REFRESH message with token over BroadcastChannel and storage', async () => {
      const channel = new BroadcastChannel('agro_session_sync');
      const received: unknown[] = [];
      channel.onmessage = (event) => {
        received.push(event.data);
      };

      broadcastSessionRefresh(VALID_TEST_TOKEN);

      await vi.waitFor(() => {
        expect(received).toHaveLength(1);
      });
      const message = received[0] as Record<string, unknown>;
      expect(message.type).toBe('SESSION_REFRESH');
      expect(message.eventId).toMatch(UUID_V4_REGEX);
      expect(message.token).toBe(VALID_TEST_TOKEN);
      const stored = localStorage.getItem('agro_session_sync');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored ?? '{}');
      expect(parsed.type).toBe('SESSION_REFRESH');
      expect(parsed.token).toBe(VALID_TEST_TOKEN);
      channel.close();
    });

    it('enforces sender isolation so local subscriber does not receive its own emitted refresh', async () => {
      const listener = vi.fn();
      const unsubscribe = subscribeToSessionSync(listener);

      broadcastSessionRefresh(VALID_TEST_TOKEN);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(listener).not.toHaveBeenCalled();
      unsubscribe();
    });
  });
});
