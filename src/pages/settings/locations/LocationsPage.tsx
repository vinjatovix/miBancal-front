import { useState } from 'react';

import { t } from '../../../i18n/core/t';
import { getLocationForEdit } from '../../../services/locations.service';
import { useToast } from '../../../shared/toast/useToast';
import type { Location } from '../../../types/Location/Location';
import DeleteLocationModal from './components/DeleteLocationModal/DeleteLocationModal';
import LocationFormModal from './components/LocationFormModal/LocationFormModal';
import { useLocationMutations } from './hooks/useLocationMutations';
import { useLocations } from './hooks/useLocations';
import LocationList from './LocationList';
import { isPreconditionConflict } from './utils/mapLocationError';

import './locations.css';

export default function LocationsPage() {
  const { query, request, setPage, setLimit, setSort } = useLocations();
  const { remove } = useLocationMutations();
  const { showToast, showSuccessToast, showErrorToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(
    null
  );
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete(loc: Location) {
    setIsDeleting(true);
    try {
      const { etag } = await getLocationForEdit(loc.id);
      await remove.mutateAsync({ id: loc.id, etag });
      showSuccessToast(t('location.delete.success'));
      setDeletingLocation(null);
    } catch (err) {
      if (isPreconditionConflict(err)) {
        showToast({
          title: t('location.delete.conflict_title'),
          message: t('location.delete.conflict_message'),
          variant: 'warning'
        });
        void query.refetch();
      } else {
        showErrorToast(err, t('location.delete.error'));
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const locations = query.data?.data ?? [];
  const totalPages = query.data?.pagination.totalPages ?? 0;

  return (
    <main className="locations-page">
      <div className="locations-container">
        <header className="locations-header">
          <div className="locations-toolbar">
            <div>
              <h1 className="locations-title">{t('location.title')}</h1>
              <p className="locations-subtitle">{t('location.subtitle')}</p>
            </div>
            <button
              type="button"
              className="locations-toolbar__add-btn"
              onClick={() => setIsCreateOpen(true)}
            >
              <span>{t('location.create_action')}</span>
            </button>
          </div>
        </header>

        <LocationList
          isLoading={query.isLoading}
          error={query.error}
          locations={locations}
          currentPage={request.pagination.page}
          totalPages={totalPages}
          currentLimit={request.pagination.limit}
          currentSortField={request.sort.field}
          currentSortDirection={request.sort.direction}
          onRetry={() => void query.refetch()}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onSortChange={setSort}
          onCreateNew={() => setIsCreateOpen(true)}
          onEdit={(loc) => setEditingLocationId(loc.id)}
          onDelete={(loc) => setDeletingLocation(loc)}
        />

        <LocationFormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        <LocationFormModal
          isOpen={Boolean(editingLocationId)}
          locationIdToEdit={editingLocationId}
          onClose={() => setEditingLocationId(null)}
        />

        <DeleteLocationModal
          isOpen={Boolean(deletingLocation)}
          location={deletingLocation}
          isDeleting={isDeleting}
          onClose={() => setDeletingLocation(null)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </main>
  );
}
