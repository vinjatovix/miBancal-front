import type { ReactElement } from 'react';
import LocationFormModal from '../../../pages/settings/locations/components/LocationFormModal/LocationFormModal';

export interface LocationQuickCreateModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCreated: (locationId: string) => void;
}

export default function LocationQuickCreateModal({
  isOpen,
  onClose,
  onCreated
}: LocationQuickCreateModalProps): ReactElement | null {
  return (
    <LocationFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSaved={(newId) => {
        if (newId) onCreated(newId);
      }}
    />
  );
}
