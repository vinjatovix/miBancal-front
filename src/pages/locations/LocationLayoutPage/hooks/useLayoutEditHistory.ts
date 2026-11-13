import { useCallback, useEffect, useRef, useState } from 'react';

import type { Point } from '../../../../components/beds/layout/utils/layoutGeometry';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';

export type EditAction =
  | { readonly type: 'move-crop'; readonly cropId: string; readonly from: Point; readonly to: Point }
  | { readonly type: 'plant'; readonly cropIds: readonly string[]; readonly bedId: string }
  | {
      readonly type: 'remove-crop';
      readonly bedId: string;
      readonly crops: readonly CropPlacementItem[];
    };

export interface UseLayoutEditHistoryParams {
  readonly onRevert: (action: EditAction) => void;
}

export interface LayoutEditHistory {
  readonly entries: readonly EditAction[];
  readonly canUndo: boolean;
  readonly push: (action: EditAction) => void;
  readonly undo: () => void;
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

  const push = useCallback((action: EditAction): void => {
    entriesRef.current = [...entriesRef.current, action];
    setEntries(entriesRef.current);
  }, []);

  const undo = useCallback((): void => {
    const stack = entriesRef.current;
    if (stack.length === 0) return;
    const top = stack.at(-1);
    if (top === undefined) return;
    entriesRef.current = stack.slice(0, -1);
    setEntries(entriesRef.current);
    onRevertRef.current(top);
  }, []);

  const clear = useCallback((): void => {
    if (entriesRef.current.length === 0) return;
    entriesRef.current = [];
    setEntries(entriesRef.current);
  }, []);

  return {
    entries,
    canUndo: entries.length > 0,
    push,
    undo,
    clear,
    reset: clear
  };
}
