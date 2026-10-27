import { beforeEach, describe, expect, it } from 'vitest';

import {
  persistMode,
  readStoredMode
} from '../../../../../src/pages/plants/components/ViewModeToggle/viewMode';

const STORAGE_KEY = 'plants:view-mode';

describe('viewMode storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('defaults to grid without saved value', () => {
    expect(readStoredMode()).toBe('grid');
  });

  it('restores list view when it is saved', () => {
    sessionStorage.setItem(STORAGE_KEY, 'list');

    expect(readStoredMode()).toBe('list');
  });

  it('degrada a cuadrícula ante un valor desconocido', () => {
    sessionStorage.setItem(STORAGE_KEY, 'carousel');

    expect(readStoredMode()).toBe('grid');
  });

  it('persiste la elección en sessionStorage', () => {
    persistMode('list');

    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('list');
  });
});
