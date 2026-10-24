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

export function renderWithProviders(
  ui: React.ReactNode,
  options?: {
    route?: InitialEntry;
    path?: string;
    queryClient?: QueryClient;
    initialToken?: string;
  }
) {
  if (options?.initialToken) {
    setStoredToken(options.initialToken);
  }

  const queryClient = options?.queryClient ?? createTestQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[options?.route ?? '/']}>
            <Routes>
              <Route path={options?.path ?? '*'} element={ui} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    )
  };
}
