import { useContext } from 'react';

import { t } from '../../../../i18n/core/t';
import { AuthContext } from '../../../../shared/auth/authContextDef';
import {
  DeleteButton,
  EditButton
} from '../../../../shared/components/ActionButtons';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import type { GardenInput } from '../../../../types/GardenInput/GardenInput';

import './gardenInputDetailStickyHeader.css';

interface Props {
  readonly gardenInput: GardenInput;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
  readonly isEditing?: boolean;
}

export const GardenInputDetailStickyHeader = ({
  gardenInput,
  onEdit,
  onDelete,
  isEditing
}: Props) => {
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;

  return (
    <div className="garden-input-detail__sticky-header">
      <div className="garden-input-detail__sticky-heading">
        <h1 className="garden-input-detail__sticky-title">
          {capitalizeFirstLetter(gardenInput.name)}
        </h1>
        {isEditor && !isEditing && (
          <div className="garden-input-detail__sticky-actions">
            {onEdit && (
              <EditButton
                onClick={onEdit}
                ariaLabel={t('gardenInput.detail.edit')}
                label={t('gardenInput.detail.edit')}
              />
            )}
            {onDelete && (
              <DeleteButton
                onClick={onDelete}
                ariaLabel={t('gardenInput.detail.delete')}
                label={t('gardenInput.detail.delete')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
