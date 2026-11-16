import type { CSSProperties, JSX } from 'react';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import LayoutGlyph from './LayoutGlyph';
import type { AnchorPoint, FloatingAnchorKind } from './utils/layoutTypes';

import './floatingObjectActions.css';

export interface FloatingObjectActionsProps {
  readonly anchor: AnchorPoint | null;
  readonly kind: FloatingAnchorKind | null;
  readonly placement?: 'above' | 'below';
  readonly onRotate?: () => void;
  readonly onUnplace?: () => void;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
  readonly onDuplicate?: () => void;
  readonly onClearSelection?: () => void;
  readonly disabled?: boolean;
}

export default function FloatingObjectActions({
  anchor,
  kind,
  placement = 'above',
  onRotate,
  onUnplace,
  onEdit,
  onDelete,
  onDuplicate,
  onClearSelection,
  disabled = false
}: FloatingObjectActionsProps): JSX.Element | null {
  if (!anchor || !kind) {
    return null;
  }

  const style: CSSProperties = {
    left: `${anchor.x}px`,
    top: `${anchor.y}px`
  };

  const className =
    placement === 'below'
      ? 'floating-object-actions floating-object-actions--below'
      : 'floating-object-actions';

  if (kind === 'crops') {
    return (
      <div
        className={className}
        role="toolbar"
        aria-label={t('bed.layout.floating_actions_label')}
        style={style}
      >
        <button
          type="button"
          className="floating-object-actions__button"
          disabled={disabled}
          onClick={onDuplicate}
          title={t('bed.layout.duplicate_selection')}
        >
          <Icon name="content_copy" decorative />
          <span>{t('bed.layout.duplicate_selection')}</span>
          <kbd className="floating-object-actions__kbd" aria-hidden="true">
            {t('bed.layout.key_d')}
          </kbd>
        </button>

        <button
          type="button"
          className="floating-object-actions__button floating-object-actions__button--danger"
          disabled={disabled}
          onClick={onDelete}
          title={t('bed.layout.delete_selection')}
        >
          <Icon name="delete" decorative />
          <span>{t('bed.layout.delete_selection')}</span>
          <kbd className="floating-object-actions__kbd" aria-hidden="true">
            {t('bed.layout.key_delete')}
          </kbd>
        </button>

        <button
          type="button"
          className="floating-object-actions__button"
          disabled={disabled}
          onClick={onClearSelection}
          title={t('bed.layout.clear_selection')}
        >
          <Icon name="close" decorative />
          <span>{t('bed.layout.clear_selection')}</span>
          <kbd className="floating-object-actions__kbd" aria-hidden="true">
            {t('bed.layout.key_esc')}
          </kbd>
        </button>
      </div>
    );
  }

  return (
    <div
      className={className}
      role="toolbar"
      aria-label={t('bed.layout.floating_actions_label')}
      style={style}
    >
      <button
        type="button"
        className="floating-object-actions__button"
        disabled={disabled}
        onClick={onRotate}
        title={t('bed.layout.rotate_action')}
      >
        <LayoutGlyph name="rotate" />
        <span>{t('bed.layout.rotate_action')}</span>
        <kbd className="floating-object-actions__kbd" aria-hidden="true">
          {t('bed.layout.key_r')}
        </kbd>
      </button>

      <button
        type="button"
        className="floating-object-actions__button"
        disabled={disabled}
        onClick={onUnplace}
        title={t('bed.layout.unplace_bed')}
      >
        <LayoutGlyph name="unplace" />
        <span>{t('bed.layout.unplace_bed')}</span>
        <kbd className="floating-object-actions__kbd" aria-hidden="true">
          {t('bed.layout.key_u')}
        </kbd>
      </button>

      <button
        type="button"
        className="floating-object-actions__button"
        disabled={disabled}
        onClick={onEdit}
        title={t('bed.layout.edit_bed_action')}
      >
        <LayoutGlyph name="edit" />
        <span>{t('bed.layout.edit_bed_action')}</span>
      </button>

      <button
        type="button"
        className="floating-object-actions__button floating-object-actions__button--danger"
        disabled={disabled}
        onClick={onDelete}
        title={t('bed.layout.delete_bed_action')}
      >
        <LayoutGlyph name="trash" />
        <span>{t('bed.layout.delete_bed_action')}</span>
      </button>
    </div>
  );
}
