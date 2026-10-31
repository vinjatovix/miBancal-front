import { useState } from 'react';
import type { FormEvent } from 'react';
import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import { useCreatePlantRelation } from '../../../pages/plantRelations/hooks/useCreatePlantRelation';
import { useUpdatePlantRelation } from '../../../pages/plantRelations/hooks/useUpdatePlantRelation';
import Modal from '../../../shared/components/Modal/Modal';
import { ApiError } from '../../../shared/errors/ApiError';
import { PreconditionFailedError } from '../../../shared/errors/PreconditionFailedError';
import type {
  PlantRelation,
  PlantRelationMechanism,
  PlantRelationType
} from '../../../types/Plants/PlantRelation';
import { extractCompanionInfo } from '../PlantRelationCard/plantRelationCard.utils';
import PlantRelationCompanionField from './PlantRelationCompanionField';
import {
  buildRelationScopes,
  getAvailableCompanionScopes,
  INITIAL_COMPANION_DRAFT,
  isCompanionDraftComplete,
  type CompanionDraft,
  type RelationFormDirection
} from './plantRelationForm.utils';
import './plantRelationFormModal.css';

const MECHANISMS: readonly PlantRelationMechanism[] = [
  'pest_repellent',
  'pollinator_attractor',
  'nitrogen_fixer',
  'nutrient_accumulator',
  'growth_stimulator',
  'trap_crop',
  'physical_support',
  'shade_provider',
  'allelopathy',
  'pest_host',
  'disease_vector',
  'resource_competition'
];

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setServerError(t('toast.form_validation_check'));
      return;
    }

    if (
      !isBedWide &&
      (minDistanceCm < 0 || maxDistanceCm < 0 || minDistanceCm > maxDistanceCm)
    ) {
      setServerError(t('toast.form_validation_check'));
      return;
    }

    try {
      if (isEditing && relationToEdit) {
        const effectiveEtag = etag || `"${relationToEdit.version}"`;
        await updateMutation.mutateAsync({
          id: relationToEdit.id,
          patch: {
            type,
            mechanism,
            strength,
            proximity: {
              minDistanceCm,
              maxDistanceCm: isBedWide ? null : maxDistanceCm
            },
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
          proximity: {
            minDistanceCm,
            maxDistanceCm: isBedWide ? null : maxDistanceCm
          },
          reason: trimmedReason
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      if (err instanceof PreconditionFailedError) {
        setServerError(t('toast.concurrent_modification'));
      } else if (err instanceof ApiError && err.status === 409) {
        setServerError(t('plantRelation.curator.errorDuplicate'));
      } else {
        setServerError(t('plantRelation.curator.errorSave'));
      }
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
          <button
            type="button"
            className="plant-relation-form-modal__btn plant-relation-form-modal__btn--secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('plantRelation.curator.cancel')}
          </button>
          <button
            type="submit"
            form="plant-relation-form"
            className="plant-relation-form-modal__btn plant-relation-form-modal__btn--primary"
            disabled={
              isSubmitting ||
              (!isEditing && !isCompanionDraftComplete(companion))
            }
          >
            {isSubmitting
              ? t('plantRelation.curator.saving')
              : t('plantRelation.curator.save')}
          </button>
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

        {!isEditing && (
          <>
            <div className="plant-relation-form-modal__field">
              <span className="plant-relation-form-modal__label">
                {t('plantRelation.curator.direction')}
              </span>
              <div className="plant-relation-form-modal__radio-group">
                <label className="plant-relation-form-modal__radio-label">
                  <input
                    type="radio"
                    name="direction"
                    value="giving"
                    checked={direction === 'giving'}
                    onChange={() => handleDirectionChange('giving')}
                  />
                  <span>
                    {t('plantRelation.curator.directionBenefitsGiven')}
                  </span>
                </label>
                <label className="plant-relation-form-modal__radio-label">
                  <input
                    type="radio"
                    name="direction"
                    value="receiving"
                    checked={direction === 'receiving'}
                    onChange={() => handleDirectionChange('receiving')}
                  />
                  <span>
                    {t('plantRelation.curator.directionBenefitsReceived')}
                  </span>
                </label>
              </div>
            </div>
            <PlantRelationCompanionField
              draft={companion}
              availableScopes={getAvailableCompanionScopes(direction)}
              basePlantId={basePlantId}
              onChange={setCompanion}
            />
          </>
        )}

        <div className="plant-relation-form-modal__field">
          <span className="plant-relation-form-modal__label">
            {t('plantRelation.curator.relationType')}
          </span>
          <div className="plant-relation-form-modal__radio-group">
            <label className="plant-relation-form-modal__radio-label">
              <input
                type="radio"
                name="type"
                value="beneficial"
                checked={type === 'beneficial'}
                onChange={() => setType('beneficial')}
              />
              <span>{t('plantRelation.curator.typeBeneficial')}</span>
            </label>
            <label className="plant-relation-form-modal__radio-label">
              <input
                type="radio"
                name="type"
                value="detrimental"
                checked={type === 'detrimental'}
                onChange={() => setType('detrimental')}
              />
              <span>{t('plantRelation.curator.typeDetrimental')}</span>
            </label>
          </div>
        </div>

        <div className="plant-relation-form-modal__field">
          <label
            htmlFor="plant-relation-mechanism"
            className="plant-relation-form-modal__label"
          >
            {t('plantRelation.curator.mechanism')}
          </label>
          <select
            id="plant-relation-mechanism"
            className="plant-relation-form-modal__select"
            value={mechanism}
            onChange={(e) =>
              setMechanism(e.target.value as PlantRelationMechanism)
            }
          >
            {MECHANISMS.map((m) => (
              <option key={m} value={m}>
                {tValue('plantRelation.mechanismValues', m)}
              </option>
            ))}
          </select>
        </div>

        <div className="plant-relation-form-modal__field">
          <label
            htmlFor="plant-relation-strength"
            className="plant-relation-form-modal__label"
          >
            {t('plantRelation.curator.strength')}: {strength}
          </label>
          <input
            id="plant-relation-strength"
            type="range"
            min="1"
            max="5"
            step="1"
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
            className="plant-relation-form-modal__range"
          />
        </div>

        <div className="plant-relation-form-modal__field">
          <label className="plant-relation-form-modal__checkbox-label">
            <input
              type="checkbox"
              checked={isBedWide}
              onChange={(e) => setIsBedWide(e.target.checked)}
            />
            <span>{t('plantRelation.curator.proximityBedWide')}</span>
          </label>
        </div>

        {!isBedWide && (
          <div className="plant-relation-form-modal__proximity-row">
            <div className="plant-relation-form-modal__field">
              <label
                htmlFor="plant-relation-proximity-min"
                className="plant-relation-form-modal__label"
              >
                {t('plantRelation.curator.proximityMin')}
              </label>
              <input
                id="plant-relation-proximity-min"
                type="number"
                min="0"
                value={minDistanceCm}
                onChange={(e) => setMinDistanceCm(Number(e.target.value))}
                className="plant-relation-form-modal__input"
              />
            </div>
            <div className="plant-relation-form-modal__field">
              <label
                htmlFor="plant-relation-proximity-max"
                className="plant-relation-form-modal__label"
              >
                {t('plantRelation.curator.proximityMax')}
              </label>
              <input
                id="plant-relation-proximity-max"
                type="number"
                min="0"
                value={maxDistanceCm}
                onChange={(e) => setMaxDistanceCm(Number(e.target.value))}
                className="plant-relation-form-modal__input"
              />
            </div>
          </div>
        )}

        <div className="plant-relation-form-modal__field">
          <label
            htmlFor="plant-relation-reason"
            className="plant-relation-form-modal__label"
          >
            {t('plantRelation.curator.reason')}
          </label>
          <textarea
            id="plant-relation-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('plantRelation.curator.reasonPlaceholder')}
            className="plant-relation-form-modal__textarea"
            required
          />
        </div>
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
