import { useRegisterSW } from 'virtual:pwa-register/react';

export interface SWUpdateState {
  needRefresh: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

export function useSWUpdate(): SWUpdateState {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW();

  return {
    needRefresh,
    updateServiceWorker
  };
}
