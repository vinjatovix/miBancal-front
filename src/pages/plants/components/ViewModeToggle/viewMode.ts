export type ViewMode = 'grid' | 'list';

const STORAGE_KEY = 'plants:view-mode';

export function readStoredMode(): ViewMode {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

export function persistMode(mode: ViewMode): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    return;
  }
}
