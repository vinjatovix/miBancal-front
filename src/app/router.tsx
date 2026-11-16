import { createBrowserRouter, type RouteObject } from 'react-router-dom';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import { IS_DEV_TOOLS } from '../config/devTools';
import Home from '../pages/Home';
import NotFoundPage from '../pages/NotFoundPage';
import OfflinePage from '../pages/OfflinePage';
import RouteErrorFallback from '../pages/RouteErrorFallback';
import { LayoutErrorFallback } from './LayoutErrorFallback';

function withLazyFallbacks(routeObjects: RouteObject[]): RouteObject[] {
  return routeObjects.map((route) => {
    const fallback = route.lazy ? { HydrateFallback: () => null } : {};
    if ('children' in route && route.children) {
      return {
        ...route,
        ...fallback,
        children: withLazyFallbacks(route.children)
      };
    }
    return {
      ...route,
      ...fallback
    };
  });
}

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/design-system',
        lazy: async () => {
          const [{ default: Component }] = await Promise.all([
            import('../pages/dev/DesignSystemPage/DesignSystemPage'),
            import('../i18n/messages/designSystem')
          ]);
          return { Component };
        }
      }
    ]
  : [];

export function createRoutes(isDevTools = IS_DEV_TOOLS): RouteObject[] {
  const devChildren: RouteObject[] = isDevTools ? devRoutes : [];
  return withLazyFallbacks([
    {
      element: <MainLayout />,
      errorElement: <LayoutErrorFallback />,
      HydrateFallback: () => null,
      children: [
        {
          errorElement: <RouteErrorFallback />,
          children: [
            { path: '/', element: <Home /> },
            {
              path: '/plants',
              lazy: async () => {
                const [{ default: Component }] = await Promise.all([
                  import('../pages/plants/PlantsPage'),
                  import('../i18n/messages/features')
                ]);
                return { Component };
              }
            },
            {
              path: '/plants/new',
              lazy: async () => {
                const [{ default: PlantCreatePage }, { EditorialRoute }] =
                  await Promise.all([
                    import('../pages/plants/PlantCreatePage'),
                    import('../shared/auth/EditorialRoute'),
                    import('../i18n/messages/features')
                  ]);
                return {
                  Component: () => (
                    <EditorialRoute>
                      <PlantCreatePage />
                    </EditorialRoute>
                  )
                };
              }
            },
            {
              path: '/plants/:slug',
              lazy: async () => {
                const [{ default: Component }] = await Promise.all([
                  import('../pages/plants/PlantDetail/PlantDetail'),
                  import('../i18n/messages/features')
                ]);
                return { Component };
              }
            },
            {
              path: '/plant-relations',
              lazy: async () => {
                const [{ default: Component }] = await Promise.all([
                  import('../pages/plantRelations/PlantRelationsPage'),
                  import('../i18n/messages/features')
                ]);
                return { Component };
              }
            },
            {
              path: '/families',
              lazy: async () => {
                const [{ default: Component }] = await Promise.all([
                  import('../pages/families/FamilyList'),
                  import('../i18n/messages/features')
                ]);
                return { Component };
              }
            },
            {
              path: '/families/new',
              lazy: async () => {
                const [{ default: FamilyCreatePage }, { EditorialRoute }] =
                  await Promise.all([
                    import('../pages/families/FamilyCreatePage'),
                    import('../shared/auth/EditorialRoute'),
                    import('../i18n/messages/features')
                  ]);
                return {
                  Component: () => (
                    <EditorialRoute>
                      <FamilyCreatePage />
                    </EditorialRoute>
                  )
                };
              }
            },
            {
              path: '/families/:id',
              lazy: async () => {
                const [{ default: Component }] = await Promise.all([
                  import('../pages/families/FamilyDetail/FamilyDetail'),
                  import('../i18n/messages/features')
                ]);
                return { Component };
              }
            },
            {
              path: '/anomalies',
              lazy: async () => {
                const [{ default: Component }] = await Promise.all([
                  import('../pages/anomalies/AnomaliesPage'),
                  import('../i18n/messages/features')
                ]);
                return { Component };
              }
            },
            {
              path: '/anomalies/new',
              lazy: async () => {
                const [{ default: AnomalyCreatePage }, { EditorialRoute }] =
                  await Promise.all([
                    import('../pages/anomalies/AnomalyCreatePage'),
                    import('../shared/auth/EditorialRoute'),
                    import('../i18n/messages/features')
                  ]);
                return {
                  Component: () => (
                    <EditorialRoute>
                      <AnomalyCreatePage />
                    </EditorialRoute>
                  )
                };
              }
            },
            {
              path: '/anomalies/:slug',
              lazy: async () => {
                const [{ default: Component }] = await Promise.all([
                  import('../pages/anomalies/AnomalyDetail/AnomalyDetail'),
                  import('../i18n/messages/features')
                ]);
                return { Component };
              }
            },
            {
              path: '/garden-inputs',
              lazy: async () => {
                const [{ default: Component }] = await Promise.all([
                  import('../pages/gardenInputs/GardenInputsPage'),
                  import('../i18n/messages/features')
                ]);
                return { Component };
              }
            },
            {
              path: '/garden-inputs/new',
              lazy: async () => {
                const [{ default: GardenInputCreatePage }, { EditorialRoute }] =
                  await Promise.all([
                    import('../pages/gardenInputs/GardenInputCreatePage'),
                    import('../shared/auth/EditorialRoute'),
                    import('../i18n/messages/features')
                  ]);
                return {
                  Component: () => (
                    <EditorialRoute>
                      <GardenInputCreatePage />
                    </EditorialRoute>
                  )
                };
              }
            },
            {
              path: '/garden-inputs/:slug',
              lazy: async () => {
                const [{ default: Component }] = await Promise.all([
                  import('../pages/gardenInputs/GardenInputDetail/GardenInputDetailPage'),
                  import('../i18n/messages/features')
                ]);
                return { Component };
              }
            },
            {
              path: '/beds',
              lazy: async () => {
                const [{ default: BedsPage }] = await Promise.all([
                  import('../pages/beds/BedsPage'),
                  import('../i18n/messages/beds'),
                  import('../i18n/messages/locations')
                ]);
                return {
                  Component: () => (
                    <ProtectedRoute requireAdmin={false}>
                      <BedsPage />
                    </ProtectedRoute>
                  )
                };
              }
            },
            {
              path: '/beds/:id',
              lazy: async () => {
                const [{ default: BedDetailPage }] = await Promise.all([
                  import('../pages/beds/BedDetailPage/BedDetailPage'),
                  import('../i18n/messages/beds'),
                  import('../i18n/messages/plantRelations')
                ]);
                return {
                  Component: () => (
                    <ProtectedRoute requireAdmin={false}>
                      <BedDetailPage />
                    </ProtectedRoute>
                  )
                };
              }
            },
            {
              path: '/locations',
              lazy: async () => {
                const [{ default: LocationsPage }] = await Promise.all([
                  import('../pages/settings/locations/LocationsPage'),
                  import('../i18n/messages/locations')
                ]);
                return {
                  Component: () => (
                    <ProtectedRoute requireAdmin={false}>
                      <LocationsPage />
                    </ProtectedRoute>
                  )
                };
              }
            },
            {
              path: '/locations/:id/layout',
              lazy: async () => {
                const [{ default: LocationLayoutPage }] = await Promise.all([
                  import('../pages/locations/LocationLayoutPage/LocationLayoutPage'),
                  import('../i18n/messages/beds'),
                  import('../i18n/messages/locations'),
                  import('../i18n/messages/plantRelations')
                ]);
                return {
                  Component: () => (
                    <ProtectedRoute requireAdmin={false}>
                      <LocationLayoutPage />
                    </ProtectedRoute>
                  )
                };
              }
            },
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
                Component: (await import('../pages/auth/GitHubCallback'))
                  .default
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
            {
              path: '/settings/locations',
              lazy: async () => {
                const [{ default: LocationsPage }] = await Promise.all([
                  import('../pages/settings/locations/LocationsPage'),
                  import('../i18n/messages/locations')
                ]);
                return {
                  Component: () => (
                    <ProtectedRoute requireAdmin={false}>
                      <LocationsPage />
                    </ProtectedRoute>
                  )
                };
              }
            },
            ...devChildren,
            { path: '/offline', element: <OfflinePage /> },
            { path: '*', element: <NotFoundPage /> }
          ]
        }
      ]
    }
  ]);
}

export const routes: RouteObject[] = createRoutes();

export const router = createBrowserRouter(routes);
