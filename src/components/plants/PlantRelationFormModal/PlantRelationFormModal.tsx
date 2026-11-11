import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { t } from '../../../i18n/core/t';
import { useCreatePlantRelation } from '../../../pages/plantRelations/hooks/useCreatePlantRelation';
import { useUpdatePlantRelation } from '../../../pages/plantRelations/hooks/useUpdatePlantRelation';
import Button from '../../../shared/components/Button/Button';
import Modal from '../../../shared/components/Modal/Modal';
import type {
  PlantRelation,
  PlantRelationMechanism,
  PlantRelationType
} from '../../../types/Plants/PlantRelation';
import { extractCompanionInfo } from '../PlantRelationCard/plantRelationCard.utils';
import { PlantRelationFormFields } from './PlantRelationFormFields';
import {
  buildRelationScopes,
  getAvailableCompanionScopes,
  INITIAL_COMPANION_DRAFT,
  isCompanionDraftComplete,
  isDistanceRangeValid,
  mapRelationSubmitError,
  type CompanionDraft,
  type RelationFormDirection
} from './plantRelationForm.utils';
import './plantRelationFormModal.css';

export interface PlantRelationFormModalProps {
  readonly isOpen: boolean;
  readonly basePlantId: string;
  readonly relationToEdit?: PlantRelation | null;
  readonly etag?: string;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

function PlantRelationFormDialog({
  isOpen,
  basePlantId,
  relationToEdit,
  etag,
  onClose,
  onSuccess
}: PlantRelationFormModalProps) {
  const isEditing = Boolean(relationToEdit);

  const [companion, setCompanion] = useState<CompanionDraft>(
    INITIAL_COMPANION_DRAFT
  );
  const [direction, setDirection] = useState<RelationFormDirection>('giving');
  const [type, setType] = useState<PlantRelationType>(
    relationToEdit?.type ?? 'beneficial'
  );
  const [mechanism, setMechanism] = useState<PlantRelationMechanism>(
    relationToEdit?.mechanism ?? 'pest_repellent'
  );
  const [strength, setStrength] = useState<number>(
    relationToEdit?.strength ?? 3
  );
  const [isBedWide, setIsBedWide] = useState<boolean>(
    relationToEdit ? relationToEdit.proximity.maxDistanceCm === null : false
  );
  const [minDistanceCm, setMinDistanceCm] = useState<number>(
    relationToEdit?.proximity.minDistanceCm ?? 0
  );
  const [maxDistanceCm, setMaxDistanceCm] = useState<number>(
    relationToEdit?.proximity.maxDistanceCm ?? 50
  );
  const [reason, setReason] = useState<string>(relationToEdit?.reason ?? '');
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreatePlantRelation();
  const updateMutation = useUpdatePlantRelation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setServerError(null);

    const trimmedReason = reason.trim();
    if (
      !trimmedReason ||
      !isDistanceRangeValid(isBedWide, minDistanceCm, maxDistanceCm)
    ) {
      setServerError(t('toast.form_validation_check'));
      return;
    }

    try {
      const proximity = {
        minDistanceCm,
        maxDistanceCm: isBedWide ? null : maxDistanceCm
      };

      if (isEditing && relationToEdit) {
        const effectiveEtag = etag || `"${relationToEdit.version}"`;
        await updateMutation.mutateAsync({
          id: relationToEdit.id,
          patch: {
            type,
            mechanism,
            strength,
            proximity,
            reason: trimmedReason
          },
          etag: effectiveEtag
        });
      } else {
        const scopes = buildRelationScopes(direction, basePlantId, companion);
        if (!scopes) {
          setServerError(t('toast.form_validation_check'));
          return;
        }

        await createMutation.mutateAsync({
          ...scopes,
          type,
          mechanism,
          strength,
          proximity,
          reason: trimmedReason
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setServerError(mapRelationSubmitError(err));
    }
  };

  const companionName =
    isEditing && relationToEdit
      ? extractCompanionInfo(relationToEdit, basePlantId).primaryName
      : undefined;

  const handleDirectionChange = (next: RelationFormDirection) => {
    setDirection(next);
    if (!getAvailableCompanionScopes(next).includes(companion.scope)) {
      setCompanion({ ...companion, scope: 'plant' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? t('plantRelation.curator.modalEditTitle')
          : t('plantRelation.curator.modalCreateTitle')
      }
      subtitle={companionName}
      footer={
        <div className="plant-relation-form-modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('plantRelation.curator.cancel')}
          </Button>
          <Button
            variant="success"
            type="submit"
            form="plant-relation-form"
            disabled={
              isSubmitting ||
              (!isEditing && !isCompanionDraftComplete(companion))
            }
          >
            {isSubmitting
              ? t('plantRelation.curator.saving')
              : t('plantRelation.curator.save')}
          </Button>
        </div>
      }
    >
      <form
        id="plant-relation-form"
        className="plant-relation-form-modal__form"
        onSubmit={handleSubmit}
      >
        {serverError && (
          <div role="alert" className="plant-relation-form-modal__error">
            {serverError}
          </div>
        )}

        <PlantRelationFormFields
          isEditing={isEditing}
          direction={direction}
          onDirectionChange={handleDirectionChange}
          companion={companion}
          onCompanionChange={setCompanion}
          basePlantId={basePlantId}
          type={type}
          onTypeChange={setType}
          mechanism={mechanism}
          onMechanismChange={setMechanism}
          strength={strength}
          onStrengthChange={setStrength}
          isBedWide={isBedWide}
          onBedWideChange={setIsBedWide}
          minDistanceCm={minDistanceCm}
          onMinDistanceChange={setMinDistanceCm}
          maxDistanceCm={maxDistanceCm}
          onMaxDistanceChange={setMaxDistanceCm}
          reason={reason}
          onReasonChange={setReason}
        />
      </form>
    </Modal>
  );
}

export default function PlantRelationFormModal(
  props: PlantRelationFormModalProps
) {
  if (!props.isOpen) return null;

  return (
    <PlantRelationFormDialog
      key={
        props.relationToEdit
          ? `edit-${props.relationToEdit.id}`
          : `create-${props.basePlantId}`
      }
      {...props}
    />
  );
}
