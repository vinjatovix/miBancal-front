import { useState, type FormEvent, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';

import { t } from '../../../i18n/core/t';
import { useBedMutations } from '../../../pages/beds/hooks/useBedMutations';
import { mapBedError } from '../../../pages/beds/utils/mapBedError';
import {
  validateBedForm,
  type BedFormErrors
} from '../../../pages/beds/utils/validateBedForm';
import LocationQuickCreateModal from '../LocationQuickCreateModal/LocationQuickCreateModal';
import { getLocationList } from '../../../services/locations.service';
import type { LocationListRequest } from '../../../services/locationListQuery';
import { useAuth } from '../../../shared/auth/useAuth';
import Button from '../../../shared/components/Button/Button';
import Drawer from '../../../shared/components/Drawer/Drawer';
import { locationKeys } from '../../../shared/reactQuery/locationKeys';
import { useToast } from '../../../shared/toast/useToast';

import './bedCreateDrawer.css';

export interface BedCreateDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCreated: (bedId: string) => void;
  readonly initialLocationId?: string;
}

const LOCATIONS_REQUEST: LocationListRequest = {
  pagination: { page: 1, limit: 100 },
  sort: { field: 'name', direction: 'asc' }
};

export default function BedCreateDrawer({
  isOpen,
  onClose,
  onCreated,
  initialLocationId
}: BedCreateDrawerProps): ReactElement | null {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const { create } = useBedMutations();
  const { showErrorToast } = useToast();

  const [name, setName] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [locationId, setLocationId] = useState(initialLocationId ?? '');
  const [errors, setErrors] = useState<BedFormErrors>({});
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { data: locationsResponse } = useQuery({
    queryKey: locationKeys.list(userId, LOCATIONS_REQUEST),
    queryFn: () => getLocationList(LOCATIONS_REQUEST),
    enabled: Boolean(userId && isOpen)
  });

  const locations = locationsResponse?.data ?? [];

  const handleClose = () => {
    setName('');
    setWidth('');
    setHeight('');
    setDepth('');
    setLocationId(initialLocationId ?? '');
    setErrors({});
    setIsLocationModalOpen(false);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validateBedForm({ name, width, height, depth, locationId });

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    const newBedId = crypto.randomUUID();
    try {
      const created = await create.mutateAsync({
        id: newBedId,
        name: name.trim(),
        width: Number(width),
        height: Number(height),
        depth: Number(depth),
        locationId: locationId.trim()
      });

      onCreated(created?.bed?.id ?? newBedId);
      onClose();
    } catch (error) {
      const mapped = mapBedError(error);
      if (mapped.isHandled) {
        setErrors(mapped.fieldErrors);
        return;
      }
      showErrorToast(error, t('bed.list.error'));
    }
  };

  const handleLocationCreated = (newLocId?: string) => {
    if (newLocId) {
      setLocationId(newLocId);
    }
    setIsLocationModalOpen(false);
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={handleClose}
        position="right"
        width={480}
      >
        {isOpen && (
          <div
            className="bed-create-drawer__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bed-drawer-title"
          >
            <div className="bed-create-drawer__header">
              <div className="bed-create-drawer__title-group">
                <h2 id="bed-drawer-title" className="bed-create-drawer__title">
                  {t('bed.drawer.title')}
                </h2>
                <p className="bed-create-drawer__subtitle">
                  {t('bed.drawer.subtitle')}
                </p>
              </div>
              <Button
                variant="neutral"
                size="sm"
                icon="close"
                aria-label={t('bed.drawer.close')}
                onClick={handleClose}
              />
            </div>

            <form
              id="bed-create-form"
              className="bed-create-drawer__form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="bed-create-drawer__field">
                <label htmlFor="bed-name" className="bed-create-drawer__label">
                  {t('bed.form.name_label')}
                </label>
                <input
                  id="bed-name"
                  type="text"
                  className={`bed-create-drawer__input ${
                    errors.name ? 'bed-create-drawer__input--error' : ''
                  }`}
                  placeholder={t('bed.form.name_placeholder')}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                />
                {errors.name && (
                  <span className="bed-create-drawer__error-text">
                    {t(errors.name as Parameters<typeof t>[0])}
                  </span>
                )}
              </div>

              <div className="bed-create-drawer__field">
                <label htmlFor="bed-width" className="bed-create-drawer__label">
                  {t('bed.form.width_label')}
                </label>
                <input
                  id="bed-width"
                  type="number"
                  step="any"
                  className={`bed-create-drawer__input ${
                    errors.width ? 'bed-create-drawer__input--error' : ''
                  }`}
                  placeholder={t('bed.form.width_placeholder')}
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value);
                    if (errors.width) {
                      setErrors((prev) => ({ ...prev, width: undefined }));
                    }
                  }}
                />
                {errors.width && (
                  <span className="bed-create-drawer__error-text">
                    {t(errors.width as Parameters<typeof t>[0])}
                  </span>
                )}
              </div>

              <div className="bed-create-drawer__field">
                <label
                  htmlFor="bed-height"
                  className="bed-create-drawer__label"
                >
                  {t('bed.form.height_label')}
                </label>
                <input
                  id="bed-height"
                  type="number"
                  step="any"
                  className={`bed-create-drawer__input ${
                    errors.height ? 'bed-create-drawer__input--error' : ''
                  }`}
                  placeholder={t('bed.form.height_placeholder')}
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    if (errors.height) {
                      setErrors((prev) => ({ ...prev, height: undefined }));
                    }
                  }}
                />
                {errors.height && (
                  <span className="bed-create-drawer__error-text">
                    {t(errors.height as Parameters<typeof t>[0])}
                  </span>
                )}
              </div>

              <div className="bed-create-drawer__field">
                <label htmlFor="bed-depth" className="bed-create-drawer__label">
                  {t('bed.form.depth_label')}
                </label>
                <input
                  id="bed-depth"
                  type="number"
                  step="any"
                  className={`bed-create-drawer__input ${
                    errors.depth ? 'bed-create-drawer__input--error' : ''
                  }`}
                  placeholder={t('bed.form.depth_placeholder')}
                  value={depth}
                  onChange={(e) => {
                    setDepth(e.target.value);
                    if (errors.depth) {
                      setErrors((prev) => ({ ...prev, depth: undefined }));
                    }
                  }}
                />
                {errors.depth && (
                  <span className="bed-create-drawer__error-text">
                    {t(errors.depth as Parameters<typeof t>[0])}
                  </span>
                )}
              </div>

              <div className="bed-create-drawer__field">
                <label
                  htmlFor="bed-location"
                  className="bed-create-drawer__label"
                >
                  {t('bed.form.location_label')}
                </label>
                <select
                  id="bed-location"
                  className={`bed-create-drawer__select ${
                    errors.locationId ? 'bed-create-drawer__select--error' : ''
                  }`}
                  value={locationId}
                  onChange={(e) => {
                    setLocationId(e.target.value);
                    if (errors.locationId) {
                      setErrors((prev) => ({ ...prev, locationId: undefined }));
                    }
                  }}
                >
                  <option value="">
                    {t('bed.form.location_select_placeholder')}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errors.locationId && (
                  <span className="bed-create-drawer__error-text">
                    {t(errors.locationId as Parameters<typeof t>[0])}
                  </span>
                )}
                <div className="bed-create-drawer__location-actions">
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={() => setIsLocationModalOpen(true)}
                  >
                    {t('bed.form.location_create_action')}
                  </Button>
                </div>
              </div>
            </form>

            <div className="bed-create-drawer__footer">
              <Button type="button" variant="secondary" onClick={handleClose}>
                {t('bed.form.cancel')}
              </Button>
              <Button
                type="submit"
                form="bed-create-form"
                variant="primary"
                disabled={create.isPending}
              >
                {create.isPending
                  ? t('bed.form.submitting')
                  : t('bed.form.submit')}
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <LocationQuickCreateModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onCreated={handleLocationCreated}
      />
    </>
  );
}
