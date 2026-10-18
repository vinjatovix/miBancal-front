import { createBrowserRouter, type RouteObject } from 'react-router-dom';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import FamilyDetail from '../pages/families/FamilyDetail/FamilyDetail';
import FamilyList from '../pages/families/FamilyList';
import Home from '../pages/Home';
import NotFoundPage from '../pages/NotFoundPage';
import PlantDetail from '../pages/plants/PlantDetail/PlantDetail';
import PlantsPage from '../pages/plants/PlantsPage';
import RouteErrorFallback from '../pages/RouteErrorFallback';
import { LayoutErrorFallback } from './LayoutErrorFallback';

export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    errorElement: <LayoutErrorFallback />,
    hydrateFallbackElement: null,
    children: [
      {
        errorElement: <RouteErrorFallback />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/plants', element: <PlantsPage /> },
          { path: '/plants/:id', element: <PlantDetail /> },
          { path: '/families', element: <FamilyList /> },
          { path: '/families/:id', element: <FamilyDetail /> },
          {
            path: '/login',
            lazy: async () => ({
              Component: (await import('../pages/auth/Login')).default
            })
          },
          {
            path: '/register',
            lazy: async () => ({
              Component: (await import('../pages/auth/Register')).default
            })
          },
          {
            path: '/activate',
            lazy: async () => ({
              Component: (await import('../pages/auth/Activate')).default
            })
          },
          {
            path: '/forgot-password',
            lazy: async () => ({
              Component: (
                await import('../pages/auth/ForgotPassword/ForgotPassword')
              ).default
            })
          },
          {
            path: '/reset-password',
            lazy: async () => ({
              Component: (
                await import('../pages/auth/ResetPassword/ResetPassword')
              ).default
            })
          },
          {
            path: '/auth/github/callback',
            lazy: async () => ({
              Component: (await import('../pages/auth/GitHubCallback')).default
            })
          },
          {
            path: '/admin',
            lazy: async () => {
              const { default: AdminDashboard } =
                await import('../pages/admin/AdminDashboard');
              return {
                Component: () => (
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                )
              };
            }
          },
          {
            path: '/settings',
            lazy: async () => {
              const { default: AccountSettings } =
                await import('../pages/settings/AccountSettings');
              return {
                Component: () => (
                  <ProtectedRoute requireAdmin={false}>
                    <AccountSettings />
                  </ProtectedRoute>
                )
              };
            }
          },
          { path: '*', element: <NotFoundPage /> }
        ]
      }
    ]
  }
];

export const router = createBrowserRouter(routes);
