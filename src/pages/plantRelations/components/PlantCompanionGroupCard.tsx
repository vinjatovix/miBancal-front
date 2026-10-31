import CompanionContainer from '../../../components/plants/PlantRelationCard/CompanionContainer';
import {
  formatProximity,
  getAppliesViaText,
  getCompanionIcon,
  getCompanionLink,
  getCompanionScopeLabel,
  getDirectionBadgeText
} from '../../../components/plants/PlantRelationCard/plantRelationCard.utils';
import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Badge from '../../../shared/components/Badge/Badge';
import Icon from '../../../shared/components/Icon/Icon';
import ScientificName from '../../../shared/components/ScientificName/ScientificName';
import type {
  PlantCompanionInfo,
  PlantRelation
} from '../../../types/Plants/PlantRelation';
import './plantCompanionGroupCard.css';

export interface PlantCompanionGroupCardProps {
  readonly companion: PlantCompanionInfo;
  readonly relations: readonly PlantRelation[];
  readonly currentPlantId: string;
  readonly currentPlantName?: string;
  readonly onEdit?: (relation: PlantRelation) => void;
  readonly onDelete?: (relation: PlantRelation) => void;
}

export default function PlantCompanionGroupCard({
  companion,
  relations,
  currentPlantId,
  currentPlantName,
  onEdit,
  onDelete
}: PlantCompanionGroupCardProps) {
  const companionLink = getCompanionLink(companion);
  const companionIcon = getCompanionIcon(companion);
  const companionScopeLabel = getCompanionScopeLabel(companion);

  return (
    <article className="plant-companion-group-card">
      <header className="plant-companion-group-card__header">
        {companion.isAvailable ? (
          <CompanionContainer
            to={companionLink}
            className="plant-companion-group-card__companion-link"
          >
            {companion.imageUrl ? (
              <img
                src={companion.imageUrl}
                alt={companion.primaryName}
                className="plant-companion-group-card__avatar"
              />
            ) : (
              <span className="plant-companion-group-card__avatar-fallback">
                <Icon name={companionIcon} decorative />
              </span>
            )}
            <div className="plant-companion-group-card__identity">
              <span className="plant-companion-group-card__name">
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
          <div className="plant-companion-group-card__unavailable">
            <span className="plant-companion-group-card__avatar-fallback">
              <Icon name={companionIcon} decorative />
            </span>
            <span className="plant-companion-group-card__unavailable-text">
              {t('plant.relations.companionUnavailable')}
            </span>
          </div>
        )}
      </header>

      <div className="plant-companion-group-card__interactions">
        {relations.map((relation) => {
          const isDetrimental = relation.type === 'detrimental';
          const directionBadgeText = getDirectionBadgeText(
            relation,
            currentPlantId,
            currentPlantName
          );
          const appliesViaText = getAppliesViaText(relation);
          const mechanismText = tValue(
            'plantRelation.mechanismValues',
            relation.mechanism
          );
          const strengthAriaLabel = t('plant.relations.strength.ariaLabel', {
            strength: relation.strength
          });
          const proximityText = formatProximity(relation.proximity);

          return (
            <div
              key={relation.id}
              className={`plant-companion-group-card__interaction ${
                isDetrimental
                  ? 'plant-companion-group-card__interaction--detrimental'
                  : 'plant-companion-group-card__interaction--beneficial'
              }`}
            >
              <div className="plant-companion-group-card__interaction-header">
                <Badge
                  variant={isDetrimental ? 'deleted' : 'default'}
                  icon={isDetrimental ? 'warning' : 'plant_relations'}
                >
                  {directionBadgeText}
                </Badge>

                {(onEdit || onDelete) && (
                  <div className="plant-companion-group-card__curator-actions">
                    {onEdit && (
                      <button
                        type="button"
                        className="plant-companion-group-card__action-btn"
                        aria-label={`${t('plantRelation.curator.editRelation')}: ${companion.primaryName ?? ''}`}
                        onClick={() => onEdit(relation)}
                      >
                        <Icon name="edit_note" decorative />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="plant-companion-group-card__action-btn plant-companion-group-card__action-btn--delete"
                        aria-label={`${t('plantRelation.curator.deleteRelation')}: ${companion.primaryName ?? ''}`}
                        onClick={() => onDelete(relation)}
                      >
                        <Icon name="delete" decorative />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="plant-companion-group-card__chips">
                <Badge variant="scientific" icon="spa">
                  {mechanismText}
                </Badge>
                {appliesViaText && (
                  <Badge variant="alias" icon="biotech">
                    {appliesViaText}
                  </Badge>
                )}
                <span
                  className="plant-companion-group-card__strength"
                  aria-label={strengthAriaLabel}
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <span
                      key={level}
                      className={`plant-companion-group-card__strength-dot ${
                        level <= relation.strength
                          ? 'plant-companion-group-card__strength-dot--active'
                          : ''
                      }`}
                    />
                  ))}
                </span>
                <span className="plant-companion-group-card__proximity">
                  <Icon name="straighten" decorative />
                  <span>{proximityText}</span>
                </span>
              </div>

              <p className="plant-companion-group-card__reason">
                {relation.reason}
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
}
