import { useEffect } from 'react';

import type {
  LayoutMode,
  PlantingToolMode
} from '../../../../components/beds/layout/utils/layoutTypes';

export interface UseLayoutKeyboardShortcutsConfig {
  readonly mode: LayoutMode;
  readonly setMode: (m: LayoutMode) => void;
  readonly setTool?: (t: PlantingToolMode) => void;
  readonly onRotateSelected?: () => void;
  readonly onUnplaceSelected?: () => void;
  readonly onDeleteSelected?: () => void;
  readonly onDuplicateSelected?: () => void;
  readonly onClearSelection?: () => void;
  readonly onFitToView?: () => void;
  readonly onSave?: () => void;
  readonly canSave?: boolean;
}

type ShortcutAction =
  | 'save'
  | 'duplicate'
  | 'delete'
  | 'clear'
  | 'mode-read'
  | 'mode-position'
  | 'mode-plants'
  | 'fit'
  | 'rotate'
  | 'unplace'
  | 'tool-select'
  | 'tool-plant-single'
  | 'tool-brush';

const MODIFIER_ACTIONS: Record<string, ShortcutAction> = {
  s: 'save',
  d: 'duplicate'
};

const GLOBAL_ACTIONS: Record<string, ShortcutAction> = {
  delete: 'delete',
  backspace: 'delete',
  escape: 'clear',
  '1': 'mode-read',
  '2': 'mode-position',
  '3': 'mode-plants',
  f: 'fit',
  '0': 'fit'
};

const POSITION_ACTIONS: Record<string, ShortcutAction> = {
  r: 'rotate',
  u: 'unplace'
};

const PLANTS_ACTIONS: Record<string, ShortcutAction> = {
  v: 'tool-select',
  p: 'tool-plant-single',
  b: 'tool-brush'
};

function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

function resolveShortcutAction(
  e: KeyboardEvent,
  mode: LayoutMode
): ShortcutAction | null {
  const key = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && MODIFIER_ACTIONS[key]) {
    return MODIFIER_ACTIONS[key];
  }
  const global = GLOBAL_ACTIONS[key];
  if (global) return global;
  if (mode === 'position') return POSITION_ACTIONS[key] ?? null;
  if (mode === 'plants') return PLANTS_ACTIONS[key] ?? null;
  return null;
}

function runShortcut(
  action: ShortcutAction,
  config: UseLayoutKeyboardShortcutsConfig
): void {
  switch (action) {
    case 'save':
      if (config.canSave) config.onSave?.();
      return;
    case 'duplicate':
      config.onDuplicateSelected?.();
      return;
    case 'delete':
      config.onDeleteSelected?.();
      return;
    case 'clear':
      config.onClearSelection?.();
      return;
    case 'mode-read':
      config.setMode('read');
      return;
    case 'mode-position':
      config.setMode('position');
      return;
    case 'mode-plants':
      config.setMode('plants');
      return;
    case 'fit':
      config.onFitToView?.();
      return;
    case 'rotate':
      config.onRotateSelected?.();
      return;
    case 'unplace':
      config.onUnplaceSelected?.();
      return;
    case 'tool-select':
      config.setTool?.('select');
      return;
    case 'tool-plant-single':
      config.setTool?.('plant-single');
      return;
    case 'tool-brush':
      config.setTool?.('brush');
      return;
  }
}

export function useLayoutKeyboardShortcuts(
  config: UseLayoutKeyboardShortcutsConfig
): void {
  const {
    mode,
    setMode,
    setTool,
    onRotateSelected,
    onUnplaceSelected,
    onDeleteSelected,
    onDuplicateSelected,
    onClearSelection,
    onFitToView,
    onSave,
    canSave = false
  } = config;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (isEditableElement(e.target)) return;
      const action = resolveShortcutAction(e, mode);
      if (!action) return;
      e.preventDefault();
      runShortcut(action, {
        mode,
        setMode,
        setTool,
        onRotateSelected,
        onUnplaceSelected,
        onDeleteSelected,
        onDuplicateSelected,
        onClearSelection,
        onFitToView,
        onSave,
        canSave
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    mode,
    setMode,
    setTool,
    onRotateSelected,
    onUnplaceSelected,
    onDeleteSelected,
    onDuplicateSelected,
    onClearSelection,
    onFitToView,
    onSave,
    canSave
  ]);
}
