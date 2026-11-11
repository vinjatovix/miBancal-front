import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Select from '../../../shared/components/Select/Select';
import type {
  PlantRelationMechanism,
  PlantRelationType
} from '../../../types/Plants/PlantRelation';
import PlantRelationCompanionField from './PlantRelationCompanionField';
import {
  type CompanionDraft,
  getAvailableCompanionScopes,
  MECHANISMS,
  type RelationFormDirection
} from './plantRelationForm.utils';

export interface PlantRelationFormFieldsProps {
  readonly isEditing: boolean;
  readonly direction: RelationFormDirection;
  readonly onDirectionChange: (dir: RelationFormDirection) => void;
  readonly companion: CompanionDraft;
  readonly onCompanionChange: (draft: CompanionDraft) => void;
  readonly basePlantId: string;
  readonly type: PlantRelationType;
  readonly onTypeChange: (type: PlantRelationType) => void;
  readonly mechanism: PlantRelationMechanism;
  readonly onMechanismChange: (mechanism: PlantRelationMechanism) => void;
  readonly strength: number;
  readonly onStrengthChange: (strength: number) => void;
  readonly isBedWide: boolean;
  readonly onBedWideChange: (isBedWide: boolean) => void;
  readonly minDistanceCm: number;
  readonly onMinDistanceChange: (distance: number) => void;
  readonly maxDistanceCm: number;
  readonly onMaxDistanceChange: (distance: number) => void;
  readonly reason: string;
  readonly onReasonChange: (reason: string) => void;
}

export function PlantRelationFormFields({
  isEditing,
  direction,
  onDirectionChange,
  companion,
  onCompanionChange,
  basePlantId,
  type,
  onTypeChange,
  mechanism,
  onMechanismChange,
  strength,
  onStrengthChange,
  isBedWide,
  onBedWideChange,
  minDistanceCm,
  onMinDistanceChange,
  maxDistanceCm,
  onMaxDistanceChange,
  reason,
  onReasonChange
}: PlantRelationFormFieldsProps) {
  return (
    <>
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
                  onChange={() => onDirectionChange('giving')}
                />
                <span>{t('plantRelation.curator.directionBenefitsGiven')}</span>
              </label>
              <label className="plant-relation-form-modal__radio-label">
                <input
                  type="radio"
                  name="direction"
                  value="receiving"
                  checked={direction === 'receiving'}
                  onChange={() => onDirectionChange('receiving')}
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
            onChange={onCompanionChange}
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
              onChange={() => onTypeChange('beneficial')}
            />
            <span>{t('plantRelation.curator.typeBeneficial')}</span>
          </label>
          <label className="plant-relation-form-modal__radio-label">
            <input
              type="radio"
              name="type"
              value="detrimental"
              checked={type === 'detrimental'}
              onChange={() => onTypeChange('detrimental')}
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
        <Select
          id="plant-relation-mechanism"
          className="plant-relation-form-modal__select"
          value={mechanism}
          onChange={(e) =>
            onMechanismChange(e.target.value as PlantRelationMechanism)
          }
          options={MECHANISMS.map((m) => ({
            value: m,
            label: tValue('plantRelation.mechanismValues', m)
          }))}
        />
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
          onChange={(e) => onStrengthChange(Number(e.target.value))}
          className="plant-relation-form-modal__range"
        />
      </div>

      <div className="plant-relation-form-modal__field">
        <label className="plant-relation-form-modal__checkbox-label">
          <input
            type="checkbox"
            checked={isBedWide}
            onChange={(e) => onBedWideChange(e.target.checked)}
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
              onChange={(e) => onMinDistanceChange(Number(e.target.value))}
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
              onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
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
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder={t('plantRelation.curator.reasonPlaceholder')}
          className="plant-relation-form-modal__textarea"
          required
        />
      </div>
    </>
  );
}
