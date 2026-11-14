import { useCallback, useEffect, useRef, useState } from 'react';

import type { DraftPlacement } from '../../../../components/beds/layout/utils/layoutTypes';
import type { Point } from '../../../../components/beds/layout/utils/layoutGeometry';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';

export type EditAction =
  | {
      readonly type: 'move-crop';
      readonly cropId: string;
      readonly from: Point;
      readonly to: Point;
    }
  | {
      readonly type: 'plant';
      readonly cropIds: readonly string[];
      readonly bedId: string;
    }
  | {
      readonly type: 'remove-crop';
      readonly bedId: string;
      readonly crops: readonly CropPlacementItem[];
    }
  | {
      readonly type: 'move-bed';
      readonly bedId: string;
      readonly from: DraftPlacement;
      readonly to: DraftPlacement;
    }
  | {
      readonly type: 'place-bed';
      readonly bedId: string;
      readonly from: DraftPlacement;
    };

export type RedoHandler = () => void;

export interface UseLayoutEditHistoryParams {
  readonly onRevert: (action: EditAction) => RedoHandler | void;
}

interface RedoEntry {
  readonly action: EditAction;
  readonly reapply: RedoHandler | undefined;
}

export interface LayoutEditHistory {
  readonly entries: readonly EditAction[];
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly push: (action: EditAction) => void;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly clear: () => void;
  readonly reset: () => void;
}

export function useLayoutEditHistory({
  onRevert
}: UseLayoutEditHistoryParams): LayoutEditHistory {
  const onRevertRef = useRef(onRevert);
  useEffect(() => {
    onRevertRef.current = onRevert;
  });

  const [entries, setEntries] = useState<readonly EditAction[]>([]);
  const entriesRef = useRef<readonly EditAction[]>(entries);
  useEffect(() => {
    entriesRef.current = entries;
  });

  const [redoStack, setRedoStack] = useState<readonly RedoEntry[]>([]);
  const redoStackRef = useRef<readonly RedoEntry[]>(redoStack);
  useEffect(() => {
    redoStackRef.current = redoStack;
  });

  const clearRedo = useCallback((): void => {
    if (redoStackRef.current.length === 0) return;
    redoStackRef.current = [];
    setRedoStack(redoStackRef.current);
  }, []);

  const push = useCallback(
    (action: EditAction): void => {
      entriesRef.current = [...entriesRef.current, action];
      setEntries(entriesRef.current);
      clearRedo();
    },
    [clearRedo]
  );

  const undo = useCallback((): void => {
    const stack = entriesRef.current;
    const top = stack.at(-1);
    if (top === undefined) return;
    entriesRef.current = stack.slice(0, -1);
    setEntries(entriesRef.current);
    const reapply = onRevertRef.current(top) ?? undefined;
    redoStackRef.current = [...redoStackRef.current, { action: top, reapply }];
    setRedoStack(redoStackRef.current);
  }, []);

  const redo = useCallback((): void => {
    const stack = redoStackRef.current;
    const top = stack.at(-1);
    if (top === undefined) return;
    redoStackRef.current = stack.slice(0, -1);
    setRedoStack(redoStackRef.current);
    top.reapply?.();
    entriesRef.current = [...entriesRef.current, top.action];
    setEntries(entriesRef.current);
  }, []);

  const clear = useCallback((): void => {
    clearRedo();
    if (entriesRef.current.length === 0) return;
    entriesRef.current = [];
    setEntries(entriesRef.current);
  }, [clearRedo]);

  return {
    entries,
    canUndo: entries.length > 0,
    canRedo: redoStack.length > 0,
    push,
    undo,
    redo,
    clear,
    reset: clear
  };
}
