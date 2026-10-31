import { useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../../i18n/core/t';
import { usePlantRelations } from '../../../pages/plants/hooks/usePlantRelations';
import { hasCatalogEditorRole } from '../../../shared/auth/roleUtils';
import { useAuth } from '../../../shared/auth/useAuth';
import BodySection from '../../../shared/components/BodySection/BodySection';
import { ErrorResponse } from '../../../shared/components/ErrorResponse/ErrorResponse';
import Icon from '../../../shared/components/Icon/Icon';
import { Loader } from '../../../shared/components/Loader/Loader';
import type { PlantRelation } from '../../../types/Plants/PlantRelation';
import PlantRelationCard from '../PlantRelationCard/PlantRelationCard';
import { categorizePlantRelations } from '../PlantRelationCard/plantRelationCard.utils';
import PlantRelationDeleteDialog from '../PlantRelationDeleteDialog/PlantRelationDeleteDialog';
import PlantRelationFormModal from '../PlantRelationFormModal/PlantRelationFormModal';
import './plantRelationsSection.css';

export interface PlantRelationsSectionProps {
  readonly plantId: string;
  readonly currentPlantName?: string;
}

export default function PlantRelationsSection({
  plantId,
  currentPlantName
}: PlantRelationsSectionProps) {
  const { user } = useAuth();
  const isCurator = hasCatalogEditorRole(user);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [relationToEdit, setRelationToEdit] = useState<PlantRelation | null>(
    null
  );
  const [relationToDelete, setRelationToDelete] =
    useState<PlantRelation | null>(null);

  const { data, isPending, isError, error, refetch } =
    usePlantRelations(plantId);

  const relations = data?.data ?? [];
  const categorized = categorizePlantRelations(relations, plantId);
  const hasRelations = relations.length > 0;

  return (
    <BodySection title={t('plant.relations.title')} icon="plant_relations">
      <div className="plant-relations-section">
        <div className="plant-relations-section__header-actions">
          {isCurator && (
            <button
              type="button"
              className="plant-relations-section__add-btn"
              onClick={() => setIsCreateOpen(true)}
            >
              <Icon name="plant_relations" decorative />
              <span>{t('plantRelation.curator.addRelation')}</span>
            </button>
          )}
          <Link
            to={`/plant-relations?plantId=${plantId}`}
            className="plant-relations-section__explorer-link"
          >
            <Icon name="plant_relations" decorative />
            <span>{t('plant.relations.viewInExplorer')}</span>
          </Link>
        </div>

        {isPending && (
          <div className="plant-relations-section__loader">
            <Loader labelKey="plant.relations.loading" />
          </div>
        )}

        {isError && <ErrorResponse error={error} onRetry={refetch} />}

        {!isPending && !isError && !hasRelations && (
          <p className="plant-relations-section__empty">
            {t('plant.relations.empty')}
          </p>
        )}

        {!isPending && !isError && hasRelations && (
          <div className="plant-relations-section__blocks">
            {categorized.benefitsReceived.length > 0 && (
              <section className="plant-relations-section__block">
                <h3 className="plant-relations-section__block-title">
                  {t('plant.relations.benefitsReceivedTitle')}
                </h3>
                <div className="plant-relations-section__cards">
                  {categorized.benefitsReceived.map((relation) => (
                    <PlantRelationCard
                      key={relation.id}
                      relation={relation}
                      currentPlantId={plantId}
                      currentPlantName={currentPlantName}
                      onEdit={
                        isCurator
                          ? () => setRelationToEdit(relation)
                          : undefined
                      }
                      onDelete={
                        isCurator
                          ? () => setRelationToDelete(relation)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {categorized.benefitsGiven.length > 0 && (
              <section className="plant-relations-section__block">
                <h3 className="plant-relations-section__block-title">
                  {t('plant.relations.benefitsGivenTitle')}
                </h3>
                <div className="plant-relations-section__cards">
                  {categorized.benefitsGiven.map((relation) => (
                    <PlantRelationCard
                      key={relation.id}
                      relation={relation}
                      currentPlantId={plantId}
                      currentPlantName={currentPlantName}
                      onEdit={
                        isCurator
                          ? () => setRelationToEdit(relation)
                          : undefined
                      }
                      onDelete={
                        isCurator
                          ? () => setRelationToDelete(relation)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {categorized.incompatibilities.length > 0 && (
              <section className="plant-relations-section__block">
                <h3 className="plant-relations-section__block-title">
                  {t('plant.relations.incompatibilitiesTitle')}
                </h3>
                <div className="plant-relations-section__cards">
                  {categorized.incompatibilities.map((relation) => (
                    <PlantRelationCard
                      key={relation.id}
                      relation={relation}
                      currentPlantId={plantId}
                      currentPlantName={currentPlantName}
                      onEdit={
                        isCurator
                          ? () => setRelationToEdit(relation)
                          : undefined
                      }
                      onDelete={
                        isCurator
                          ? () => setRelationToDelete(relation)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {isCurator && (
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
    </BodySection>
  );
}
