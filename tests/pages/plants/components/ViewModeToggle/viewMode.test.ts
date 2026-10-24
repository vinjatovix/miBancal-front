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

  it('por defecto lee cuadrícula sin valor guardado', () => {
    expect(readStoredMode()).toBe('grid');
  });

  it('restaura la vista lista cuando está guardada', () => {
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
