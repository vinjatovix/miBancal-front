import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  consumeSessionTransferToken,
  createSessionTransferTicket,
  createSessionTransferUrl
} from '../../../src/shared/auth/sessionTransfer';
import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';

describe('sessionTransfer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('generates a unique ticket and stores token in localStorage with expiration', () => {
    const ticket = createSessionTransferTicket(VALID_TEST_TOKEN);

    const storedRaw = localStorage.getItem(`session_transfer_${ticket}`);
    const stored = JSON.parse(storedRaw ?? '{}');
    expect(ticket).toMatch(/^[a-f0-9-]+$/);
    expect(stored.token).toBe(VALID_TEST_TOKEN);
    expect(stored.expiresAt).toBeGreaterThan(Date.now());
  });

  it('builds target URL containing session_transfer hash parameter', () => {
    const url = createSessionTransferUrl('/families/new', VALID_TEST_TOKEN);

    expect(url).toMatch(/^\/families\/new#session_transfer=[a-f0-9-]+$/);
  });

  it('consumes token and removes entry from localStorage upon consumption', () => {
    const ticket = createSessionTransferTicket(VALID_TEST_TOKEN);
    window.history.pushState(
      null,
      '',
      `/families/new#session_transfer=${ticket}`
    );

    const consumed = consumeSessionTransferToken();

    expect(consumed).toBe(VALID_TEST_TOKEN);
    expect(localStorage.getItem(`session_transfer_${ticket}`)).toBeNull();
  });

  it('sanitizes session_transfer from URL hash during consumption', () => {
    const ticket = createSessionTransferTicket(VALID_TEST_TOKEN);
    window.history.pushState(
      null,
      '',
      `/families/new#session_transfer=${ticket}`
    );
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    consumeSessionTransferToken();

    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/families/new');
  });

  it('returns null and leaves localStorage untouched when no ticket is present in hash', () => {
    window.history.pushState(null, '', '/families/new#unrelated=123');

    const consumed = consumeSessionTransferToken();

    expect(consumed).toBeNull();
  });

  it('returns null when ticket does not exist in localStorage', () => {
    window.history.pushState(
      null,
      '',
      '/families/new#session_transfer=non-existent-ticket'
    );

    const consumed = consumeSessionTransferToken();

    expect(consumed).toBeNull();
  });

  it('returns null when ticket in localStorage is expired', () => {
    const expiredTicket = 'expired-uuid';
    localStorage.setItem(
      `session_transfer_${expiredTicket}`,
      JSON.stringify({
        token: VALID_TEST_TOKEN,
        expiresAt: Date.now() - 1000
      })
    );
    window.history.pushState(
      null,
      '',
      `/families/new#session_transfer=${expiredTicket}`
    );

    const consumed = consumeSessionTransferToken();

    expect(consumed).toBeNull();
  });

  it('returns null when ticket data in localStorage is corrupted', () => {
    const corruptTicket = 'corrupt-uuid';
    localStorage.setItem(`session_transfer_${corruptTicket}`, 'invalid-json');
    window.history.pushState(
      null,
      '',
      `/families/new#session_transfer=${corruptTicket}`
    );

    const consumed = consumeSessionTransferToken();

    expect(consumed).toBeNull();
  });
});
