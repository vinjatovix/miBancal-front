import { useContext, useEffect } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';

import { CancelConfirmModal } from '../Modal/CancelConfirmModal';

interface Props {
  readonly when: boolean;
  readonly prompt: string;
}

function useBeforeUnloadGuard(when: boolean): void {
  useEffect(() => {
    if (!when) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when]);
}

function NavigationBlocker({ when, prompt }: Props) {
  const blocker = useBlocker(when);

  return (
    <CancelConfirmModal
      isOpen={blocker.state === 'blocked'}
      prompt={prompt}
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    />
  );
}

export function UnsavedChangesGuard({ when, prompt }: Props) {
  const hasDataRouter = useContext(UNSAFE_DataRouterContext) !== null;
  useBeforeUnloadGuard(when);

  return hasDataRouter ? (
    <NavigationBlocker when={when} prompt={prompt} />
  ) : null;
}
