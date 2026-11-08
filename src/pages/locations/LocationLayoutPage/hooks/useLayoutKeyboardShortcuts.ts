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

export function useLayoutKeyboardShortcuts({
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
}: UseLayoutKeyboardShortcutsConfig): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (isEditableElement(e.target)) return;

      const isModifier = e.ctrlKey || e.metaKey;
      const lowerKey = e.key.toLowerCase();

      if (isModifier && lowerKey === 's') {
        e.preventDefault();
        if (canSave) onSave?.();
        return;
      }

      if (isModifier && lowerKey === 'd') {
        e.preventDefault();
        onDuplicateSelected?.();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteSelected?.();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClearSelection?.();
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        setMode('read');
        return;
      }

      if (e.key === '2') {
        e.preventDefault();
        setMode('position');
        return;
      }

      if (e.key === '3') {
        e.preventDefault();
        setMode('plants');
        return;
      }

      if (lowerKey === 'f' || e.key === '0') {
        e.preventDefault();
        onFitToView?.();
        return;
      }

      if (mode === 'position') {
        if (lowerKey === 'r') {
          e.preventDefault();
          onRotateSelected?.();
          return;
        }
        if (lowerKey === 'u') {
          e.preventDefault();
          onUnplaceSelected?.();
          return;
        }
      }

      if (mode === 'plants') {
        if (lowerKey === 'v') {
          e.preventDefault();
          setTool?.('select');
        } else if (lowerKey === 'p') {
          e.preventDefault();
          setTool?.('plant-single');
        } else if (lowerKey === 'b') {
          e.preventDefault();
          setTool?.('brush');
        }
      }
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
