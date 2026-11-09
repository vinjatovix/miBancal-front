import { useMemo } from 'react';
import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Modal from '../../../shared/components/Modal/Modal';
import type { PlantRelation } from '../../../types/Plants/PlantRelation';
import type {
  ActiveAssociationLink,
  AssociationCropPoint,
  AssociationVisualPolarity
} from './types/cropAssociationTypes';
import './cropAssociationInspectionModal.css';
import './cropRelationsModal.css';

export interface CropRelationsModalProps {
  readonly isOpen: boolean;
  readonly focusCropId: string | null;
  readonly focusCropName: string;
  readonly links: readonly ActiveAssociationLink[];
  readonly onClose: () => void;
}

interface NeighborGroup {
  readonly key: string;
  readonly neighbor: AssociationCropPoint;
  readonly count: number;
  readonly minDistanceCm: number;
  readonly visualPolarity: AssociationVisualPolarity;
  readonly isWarningPriority: boolean;
  readonly relations: readonly PlantRelation[];
}

export default function CropRelationsModal({
  isOpen,
  focusCropId,
  focusCropName,
  links,
  onClose
}: CropRelationsModalProps) {
  const groups = useMemo<readonly NeighborGroup[]>(() => {
    if (!focusCropId) return [];
    const byPlant = new Map<
      string,
      { neighbor: AssociationCropPoint; links: ActiveAssociationLink[] }
    >();
    for (const link of links) {
      const neighbor = link.cropA.id === focusCropId ? link.cropB : link.cropA;
      const key = neighbor.plantId || neighbor.id;
      const existing = byPlant.get(key);
      if (existing) existing.links.push(link);
      else byPlant.set(key, { neighbor, links: [link] });
    }

    return [...byPlant.entries()]
      .map(([key, { neighbor, links: groupLinks }]) => {
        const relationsById = new Map<string, PlantRelation>();
        for (const link of groupLinks) {
          for (const relation of link.relations) {
            relationsById.set(relation.id, relation);
          }
        }
        const isWarningPriority = groupLinks.some(
          (link) => link.isWarningPriority
        );
        const hasDetrimental = groupLinks.some(
          (link) => link.visualPolarity === 'detrimental'
        );
        return {
          key,
          neighbor,
          count: groupLinks.length,
          minDistanceCm: Math.min(...groupLinks.map((link) => link.distanceCm)),
          visualPolarity: hasDetrimental ? 'detrimental' : 'beneficial',
          isWarningPriority,
          relations: [...relationsById.values()]
        };
      })
      .sort((a, b) => {
        if (a.visualPolarity !== b.visualPolarity) {
          return a.visualPolarity === 'detrimental' ? -1 : 1;
        }
        return a.minDistanceCm - b.minDistanceCm;
      });
  }, [links, focusCropId]);

  if (!isOpen || !focusCropId) {
    return null;
  }

  const hasDetrimental = groups.some(
    (group) => group.visualPolarity === 'detrimental'
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('bed.associations.crop_modal_title', { name: focusCropName })}
      subtitle={t('bed.associations.crop_modal_count', {
        count: groups.length
      })}
      icon={hasDetrimental ? 'warning' : 'plant_relations'}
      variant={hasDetrimental ? 'warning' : 'default'}
      closeLabel={t('bed.associations.crop_modal_close')}
      maxWidth="34rem"
    >
      <div className="crop-association-modal__content">
        {groups.length === 0 ? (
          <p className="crop-relations-modal__empty">
            {t('bed.associations.crop_modal_empty')}
          </p>
        ) : (
          groups.map((group) => {
            const isDetrimental = group.visualPolarity === 'detrimental';
            return (
              <section
                key={group.key}
                className="crop-relations-modal__neighbor"
              >
                <header className="crop-relations-modal__neighbor-header">
                  <span className="crop-relations-modal__neighbor-name">
                    {group.neighbor.commonName}
                    {group.count > 1 && (
                      <span className="crop-relations-modal__neighbor-count">
                        {t('bed.associations.crop_neighbor_instances', {
                          count: group.count
                        })}
                      </span>
                    )}
                  </span>
                  <div className="crop-association-modal__header-badges">
                    <span
                      className={`crop-association-modal__polarity-badge crop-association-modal__polarity-badge--${group.visualPolarity}`}
                    >
                      {isDetrimental
                        ? t('bed.associations.polarity_detrimental')
                        : t('bed.associations.polarity_beneficial')}
                    </span>
                    <span className="crop-association-modal__scope-badge">
                      {t(
                        group.count > 1
                          ? 'bed.associations.crop_neighbor_closest'
                          : 'bed.associations.crop_neighbor_distance',
                        { distance: group.minDistanceCm }
                      )}
                    </span>
                  </div>
                </header>

                {group.isWarningPriority && (
                  <div
                    className="crop-association-modal__warning-notice"
                    role="alert"
                  >
                    {t('bed.associations.mixed_warning_notice')}
                  </div>
                )}

                <div className="crop-association-modal__relations-list">
                  {group.relations.map((relation) => {
                    const isRelDetrimental = relation.type === 'detrimental';
                    const mechanismLabel = relation.mechanism
                      ? tValue(
                          'plantRelation.mechanismValues',
                          relation.mechanism
                        )
                      : undefined;

                    return (
                      <article
                        key={relation.id}
                        className="crop-association-modal__relation-item"
                      >
                        <div className="crop-association-modal__relation-meta">
                          <span className="crop-association-modal__mechanism">
                            {mechanismLabel ??
                              (isRelDetrimental
                                ? t('bed.associations.concurrent_detrimental')
                                : t('bed.associations.concurrent_beneficial'))}
                          </span>
                          {relation.strength !== undefined && (
                            <span className="crop-association-modal__strength">
                              {t('bed.associations.strength_label', {
                                strength: relation.strength
                              })}
                            </span>
                          )}
                        </div>
                        {relation.reason && (
                          <p className="crop-association-modal__reason">
                            {relation.reason}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </Modal>
  );
}
