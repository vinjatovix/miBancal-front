import { render } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
  type InitialEntry
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './createTestQueryClient';
import { AuthProvider } from '../../src/shared/auth/AuthContext';
import { setStoredToken } from '../../src/shared/auth/session';
import { ToastProvider } from '../../src/shared/toast/ToastContext';
import { toastStore } from '../../src/shared/toast/toastStore';

export function renderWithProviders(
  ui: React.ReactNode,
  options?: {
    route?: InitialEntry;
    path?: string;
    queryClient?: QueryClient;
    initialToken?: string;
  }
) {
  toastStore.clearToasts();

  if (options?.initialToken) {
    setStoredToken(options.initialToken);
  }

  const queryClient = options?.queryClient ?? createTestQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={[options?.route ?? '/']}>
              <Routes>
                <Route path={options?.path ?? '*'} element={ui} />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    )
  };
}
