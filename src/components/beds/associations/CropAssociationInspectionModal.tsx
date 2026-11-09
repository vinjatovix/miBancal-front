import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import Modal from '../../../shared/components/Modal/Modal';
import type { CropAssociationInspectionModalProps } from './types/cropAssociationTypes';
import './cropAssociationInspectionModal.css';

export default function CropAssociationInspectionModal({
  link,
  isOpen,
  onClose
}: CropAssociationInspectionModalProps) {
  if (!link || !isOpen) {
    return null;
  }

  const isDetrimental = link.visualPolarity === 'detrimental';
  const subtitle = `${link.cropA.commonName} y ${link.cropB.commonName}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('bed.associations.modal_title')}
      subtitle={subtitle}
      icon={isDetrimental ? 'warning' : 'plant_relations'}
      variant={isDetrimental ? 'warning' : 'default'}
      closeLabel={t('bed.associations.modal_close')}
      maxWidth="32rem"
    >
      <div className="crop-association-modal__content">
        <div className="crop-association-modal__header-badges">
          <span
            className={`crop-association-modal__polarity-badge crop-association-modal__polarity-badge--${link.visualPolarity}`}
          >
            {isDetrimental
              ? t('bed.associations.polarity_detrimental')
              : t('bed.associations.polarity_beneficial')}
          </span>
          <span className="crop-association-modal__scope-badge">
            {link.scope === 'cross_bed'
              ? t('bed.associations.badge_cross_bed')
              : t('bed.associations.badge_intra_bed')}
          </span>
        </div>

        {link.isWarningPriority && (
          <div className="crop-association-modal__warning-notice" role="alert">
            {t('bed.associations.mixed_warning_notice')}
          </div>
        )}

        <div className="crop-association-modal__metric-card">
          <span className="crop-association-modal__metric-label">
            {t('bed.associations.distance_label')}
          </span>
          <span className="crop-association-modal__metric-value">
            {t('bed.associations.distance_value', {
              distance: link.distanceCm,
              reach: link.effectiveReachCm
            })}
          </span>
        </div>

        <div className="crop-association-modal__relations-list">
          {link.relations.map((relation) => {
            const isRelDetrimental = relation.type === 'detrimental';
            const mechanismLabel = relation.mechanism
              ? tValue('plantRelation.mechanismValues', relation.mechanism)
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
      </div>
    </Modal>
  );
}
