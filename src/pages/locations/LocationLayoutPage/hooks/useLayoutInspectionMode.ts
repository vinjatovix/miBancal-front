import { useCallback, useState } from 'react';

import { useIsDesktop } from '../../../../shared/hooks/useIsDesktop';

export interface LayoutInspectionMode {
  readonly isMobile: boolean;
  readonly editingEnabled: boolean;
  readonly enableEditing: () => void;
  readonly disableEditing: () => void;
  readonly guardEditAction: <A extends readonly unknown[]>(
    action?: (...args: A) => void
  ) => ((...args: A) => void) | undefined;
}

export function useLayoutInspectionMode(): LayoutInspectionMode {
  const isDesktop = useIsDesktop();
  const isMobile = !isDesktop;
  const [editingActivated, setEditingActivated] = useState(false);

  const editingEnabled = !isMobile || editingActivated;

  const enableEditing = useCallback(() => setEditingActivated(true), []);
  const disableEditing = useCallback(() => setEditingActivated(false), []);

  const guardEditAction = useCallback(
    <A extends readonly unknown[]>(
      action?: (...args: A) => void
    ): ((...args: A) => void) | undefined =>
      editingEnabled ? action : undefined,
    [editingEnabled]
  );

  return {
    isMobile,
    editingEnabled,
    enableEditing,
    disableEditing,
    guardEditAction
  };
}
