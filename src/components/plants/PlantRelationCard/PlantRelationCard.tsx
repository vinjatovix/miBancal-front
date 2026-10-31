import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Badge from '../../../shared/components/Badge/Badge';
import Icon from '../../../shared/components/Icon/Icon';
import ScientificName from '../../../shared/components/ScientificName/ScientificName';
import type { PlantRelation } from '../../../types/Plants/PlantRelation';
import CompanionContainer from './CompanionContainer';
import {
  extractCompanionInfo,
  formatProximity,
  getAppliesViaText,
  getCompanionIcon,
  getCompanionLink,
  getCompanionScopeLabel,
  getDirectionBadgeText
} from './plantRelationCard.utils';
import './plantRelationCard.css';

export interface PlantRelationCardProps {
  readonly relation: PlantRelation;
  readonly currentPlantId: string;
  readonly currentPlantName?: string;
  readonly onEdit?: (relation: PlantRelation) => void;
  readonly onDelete?: (relation: PlantRelation) => void;
}

export default function PlantRelationCard({
  relation,
  currentPlantId,
  currentPlantName,
  onEdit,
  onDelete
}: PlantRelationCardProps) {
  const companion = extractCompanionInfo(relation, currentPlantId);
  const directionBadgeText = getDirectionBadgeText(
    relation,
    currentPlantId,
    currentPlantName
  );
  const companionLink = getCompanionLink(companion);
  const companionIcon = getCompanionIcon(companion);
  const companionScopeLabel = getCompanionScopeLabel(companion);
  const appliesViaText = getAppliesViaText(relation);
  const proximityText = formatProximity(relation.proximity);
  const mechanismText = tValue(
    'plantRelation.mechanismValues',
    relation.mechanism
  );
  const strengthAriaLabel = t('plant.relations.strength.ariaLabel', {
    strength: relation.strength
  });

  const isDetrimental = relation.type === 'detrimental';

  return (
    <article
      className={`plant-relation-card ${
        isDetrimental
          ? 'plant-relation-card--detrimental'
          : 'plant-relation-card--beneficial'
      }`}
    >
      <header className="plant-relation-card__header">
        <div className="plant-relation-card__companion">
          {companion.isAvailable ? (
            <CompanionContainer
              to={companionLink}
              className="plant-relation-card__companion-link"
            >
              {companion.imageUrl ? (
                <img
                  src={companion.imageUrl}
                  alt={companion.primaryName}
                  className="plant-relation-card__avatar"
                />
              ) : (
                <span className="plant-relation-card__avatar-fallback">
                  <Icon name={companionIcon} decorative />
                </span>
              )}
              <div className="plant-relation-card__identity">
                <span className="plant-relation-card__name">
                  {companion.primaryName}
                </span>
                {companion.scientificName && (
                  <ScientificName variant="secondary">
                    {companion.scientificName}
                  </ScientificName>
                )}
                {companionScopeLabel && (
                  <Badge variant="family">{companionScopeLabel}</Badge>
                )}
              </div>
            </CompanionContainer>
          ) : (
            <div className="plant-relation-card__unavailable">
              <span className="plant-relation-card__avatar-fallback">
                <Icon name={companionIcon} decorative />
              </span>
              <span className="plant-relation-card__unavailable-text">
                {t('plant.relations.companionUnavailable')}
              </span>
            </div>
          )}
        </div>

        <div className="plant-relation-card__header-badges">
          <Badge
            variant={isDetrimental ? 'deleted' : 'default'}
            icon={isDetrimental ? 'warning' : 'plant_relations'}
          >
            {directionBadgeText}
          </Badge>
          {(onEdit || onDelete) && (
            <div className="plant-relation-card__curator-actions">
              {onEdit && (
                <button
                  type="button"
                  className="plant-relation-card__action-btn"
                  aria-label={`${t('plantRelation.curator.editRelation')}: ${companion.primaryName ?? ''}`}
                  onClick={() => onEdit(relation)}
                >
                  <Icon name="edit_note" decorative />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="plant-relation-card__action-btn plant-relation-card__action-btn--delete"
                  aria-label={`${t('plantRelation.curator.deleteRelation')}: ${companion.primaryName ?? ''}`}
                  onClick={() => onDelete(relation)}
                >
                  <Icon name="delete" decorative />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="plant-relation-card__chips">
        <Badge variant="scientific" icon="spa">
          {mechanismText}
        </Badge>
        {appliesViaText && (
          <Badge variant="alias" icon="biotech">
            {appliesViaText}
          </Badge>
        )}
        <span
          className="plant-relation-card__strength"
          aria-label={strengthAriaLabel}
        >
          {[1, 2, 3, 4, 5].map((level) => (
            <span
              key={level}
              className={`plant-relation-card__strength-dot ${
                level <= relation.strength
                  ? 'plant-relation-card__strength-dot--active'
                  : ''
              }`}
            />
          ))}
        </span>
        <span className="plant-relation-card__proximity">
          <Icon name="straighten" decorative />
          <span>{proximityText}</span>
        </span>
      </div>

      <p className="plant-relation-card__reason">{relation.reason}</p>
    </article>
  );
}
