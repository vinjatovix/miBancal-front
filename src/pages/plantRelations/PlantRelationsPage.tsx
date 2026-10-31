import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PlantCompanionGroupCard from './components/PlantCompanionGroupCard';
import PlantRelationDeleteDialog from '../../components/plants/PlantRelationDeleteDialog/PlantRelationDeleteDialog';
import PlantRelationFormModal from '../../components/plants/PlantRelationFormModal/PlantRelationFormModal';
import {
  groupRelationsByCompanion,
  sortCompanionGroups
} from '../../components/plants/PlantRelationCard/plantRelationCard.utils';
import { t } from '../../i18n/core/t';
import { hasCatalogEditorRole } from '../../shared/auth/roleUtils';
import { useAuth } from '../../shared/auth/useAuth';
import { ErrorResponse } from '../../shared/components/ErrorResponse/ErrorResponse';
import Icon from '../../shared/components/Icon/Icon';
import { Loader } from '../../shared/components/Loader/Loader';
import Button from '../../shared/components/Button/Button';
import PlantSortSelect from '../../shared/components/PlantSortSelect/PlantSortSelect';
import ScientificName from '../../shared/components/ScientificName/ScientificName';
import { capitalizeFirstLetter } from '../../shared/utils/capitalizeFirstLetter';
import type { PlantListItem } from '../../types/Plants/Plant';
import type {
  PlantRelation,
  RelationFilterCounts,
  RelationTabFilter
} from '../../types/Plants/PlantRelation';
import type { PlantSort } from '../../services/plantListQuery';
import { usePlant } from '../plants/hooks/usePlant';
import { usePlantRelations } from '../plants/hooks/usePlantRelations';
import {
  buildSortOptions,
  splitSortValue
} from '../plants/utils/buildSortOptions';
import PlantRelationSearchCombobox from './components/PlantRelationSearchCombobox';
import PlantRelationTabs from './components/PlantRelationTabs';
import {
  buildPlantRelationsSearchParams,
  parsePlantRelationsSearchParams
} from './utils/plantRelationsUrl.utils';
import './plantRelationsPage.css';

const SORT_OPTIONS = buildSortOptions();

export default function PlantRelationsPage() {
  const { user } = useAuth();
  const isCurator = hasCatalogEditorRole(user);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [relationToEdit, setRelationToEdit] = useState<PlantRelation | null>(
    null
  );
  const [relationToDelete, setRelationToDelete] =
    useState<PlantRelation | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { plantId, type, sort } = parsePlantRelationsSearchParams(searchParams);

  const { data: plantData } = usePlant(plantId ?? undefined);
  const {
    data: relationsResponse,
    isPending,
    isError,
    error,
    refetch
  } = usePlantRelations(plantId ?? undefined);

  const relations = useMemo(
    () => relationsResponse?.data ?? [],
    [relationsResponse]
  );

  const counts: RelationFilterCounts = {
    all: relations.length,
    beneficial: relations.filter((r) => r.type === 'beneficial').length,
    detrimental: relations.filter((r) => r.type === 'detrimental').length
  };

  const filteredRelations = useMemo(
    () =>
      relations.filter((relation) => {
        if (type === 'all') return true;
        return relation.type === type;
      }),
    [relations, type]
  );

  const sortedCompanionGroups = useMemo(() => {
    if (!plantId) return [];
    const groups = groupRelationsByCompanion(filteredRelations, plantId);
    return sortCompanionGroups(groups, sort);
  }, [filteredRelations, plantId, sort]);

  const [localSelectedPlant, setLocalSelectedPlant] =
    useState<PlantListItem | null>(null);

  const focalPlant = plantId ? (plantData ?? localSelectedPlant) : null;
  const selectedPlant: PlantListItem | null =
    (focalPlant as PlantListItem | null) ?? null;

  const handleSelectPlant = (plant: PlantListItem | null) => {
    setLocalSelectedPlant(plant);
    setSearchParams(
      buildPlantRelationsSearchParams({
        plantId: plant?.id ?? null,
        type,
        sort
      })
    );
  };

  const handleTabChange = (newType: RelationTabFilter) => {
    setSearchParams(
      buildPlantRelationsSearchParams({
        plantId,
        type: newType,
        sort
      })
    );
  };

  const handleSortChange = (newSort: PlantSort) => {
    setSearchParams(
      buildPlantRelationsSearchParams({
        plantId,
        type,
        sort: newSort
      })
    );
  };

  return (
    <div className="plant-relations-page">
      <header className="plant-relations-page__header">
        <h1 className="plant-relations-page__title">
          {t('plantRelations.title')}
        </h1>
        <p className="plant-relations-page__subtitle">
          {t('plantRelations.subtitle')}
        </p>
      </header>

      <div className="plant-relations-page__controls">
        <div className="plant-relations-page__sort">
          <PlantSortSelect
            label={t('plant.orders.sort_label')}
            value={`${sort.field}:${sort.direction}`}
            options={SORT_OPTIONS}
            onChange={(value) => {
              const { field, direction } = splitSortValue(value);
              handleSortChange({ field, direction });
            }}
          />
        </div>

        {isCurator && plantId && (
          <Button
            variant="success"
            icon="plant_relations"
            onClick={() => setIsCreateOpen(true)}
          >
            {t('plantRelation.curator.addRelation')}
          </Button>
        )}
      </div>

      <section className="plant-relations-page__search-section">
        <PlantRelationSearchCombobox
          selectedPlant={selectedPlant}
          onSelectPlant={handleSelectPlant}
        />
      </section>

      {focalPlant && (
        <aside
          className="plant-relations-page__focal-bar"
          aria-label={t('plantRelations.focalPlantLabel')}
        >
          <div className="plant-relations-page__focal-identity">
            {focalPlant.image?.url ? (
              <img
                src={focalPlant.image.url}
                alt={focalPlant.identity.name.primary}
                className="plant-relations-page__focal-avatar"
              />
            ) : (
              <span className="plant-relations-page__focal-avatar-fallback">
                <Icon name="potted_plant" decorative />
              </span>
            )}
            <div className="plant-relations-page__focal-names">
              <span className="plant-relations-page__focal-name">
                {capitalizeFirstLetter(focalPlant.identity.name.primary)}
              </span>
              {focalPlant.identity.scientificName && (
                <ScientificName variant="secondary">
                  {focalPlant.identity.scientificName}
                </ScientificName>
              )}
            </div>
          </div>

          <Link
            to={`/plants/${focalPlant.slug ?? focalPlant.id}`}
            className="plant-relations-page__focal-link"
            aria-label={t('plantRelations.viewPlantDetail', {
              name: focalPlant.identity.name.primary
            })}
          >
            <span>
              {t('plantRelations.viewPlantDetail', {
                name: focalPlant.identity.name.primary
              })}
            </span>
            <Icon name="arrow_forward" decorative />
          </Link>
        </aside>
      )}

      {!plantId && (
        <section className="plant-relations-page__empty-prompt">
          <div className="plant-relations-page__empty-icon-wrap">
            <Icon
              name="plant_relations"
              decorative
              className="plant-relations-page__empty-icon"
            />
          </div>
          <h2 className="plant-relations-page__empty-title">
            {t('plantRelations.explorer.emptyTitle')}
          </h2>
          <p className="plant-relations-page__empty-text">
            {t('plantRelations.explorer.initialPrompt')}
          </p>
        </section>
      )}

      {plantId && (
        <section className="plant-relations-page__results">
          {isPending && (
            <div className="plant-relations-page__loader">
              <Loader labelKey="plantRelations.loadingRelations" />
            </div>
          )}

          {isError && <ErrorResponse error={error} onRetry={refetch} />}

          {!isPending && !isError && (
            <div className="plant-relations-page__tabs-bar">
              <PlantRelationTabs
                activeTab={type}
                counts={counts}
                onTabChange={handleTabChange}
              />
            </div>
          )}

          {!isPending && !isError && relations.length === 0 && (
            <p className="plant-relations-page__no-relations">
              {t('plant.relations.empty')}
            </p>
          )}

          {!isPending && !isError && relations.length > 0 && (
            <>
              {filteredRelations.length === 0 ? (
                <p className="plant-relations-page__empty-filter">
                  {t('plantRelations.explorer.emptyFilter')}
                </p>
              ) : (
                <div
                  className="plant-relations-page__cards"
                  role="tabpanel"
                  id={`panel-${type}`}
                >
                  {sortedCompanionGroups.map((group) => (
                    <PlantCompanionGroupCard
                      key={`${group.companion.scope}:${group.companion.id}`}
                      companion={group.companion}
                      relations={group.relations}
                      currentPlantId={plantId}
                      currentPlantName={selectedPlant?.identity?.name?.primary}
                      onEdit={
                        isCurator
                          ? (relation) => setRelationToEdit(relation)
                          : undefined
                      }
                      onDelete={
                        isCurator
                          ? (relation) => setRelationToDelete(relation)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {isCurator && plantId && (
        <>
          <PlantRelationFormModal
            isOpen={isCreateOpen || relationToEdit !== null}
            basePlantId={plantId}
            relationToEdit={relationToEdit}
            onClose={() => {
              setIsCreateOpen(false);
              setRelationToEdit(null);
            }}
            onSuccess={() => refetch()}
          />

          <PlantRelationDeleteDialog
            isOpen={relationToDelete !== null}
            relation={relationToDelete}
            etag={relationToDelete ? `"${relationToDelete.version}"` : ''}
            onClose={() => setRelationToDelete(null)}
            onSuccess={() => refetch()}
          />
        </>
      )}
    </div>
  );
}
