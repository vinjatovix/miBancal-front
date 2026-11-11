import { useCallback, useEffect, useRef, useState, type JSX } from 'react';

import LayoutGlyph from '../../../../components/beds/layout/LayoutGlyph';
import { t } from '../../../../i18n/core/t';
import Button from '../../../../shared/components/Button/Button';
import Icon from '../../../../shared/components/Icon/Icon';

import './layoutKeyboardHelp.css';

export default function LayoutKeyboardHelp(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <div className="layout-keyboard-help">
      <button
        type="button"
        className="layout-keyboard-help__trigger"
        aria-label={t('bed.layout.shortcuts_button')}
        title={t('bed.layout.shortcuts_button')}
        onClick={handleOpen}
      >
        <LayoutGlyph name="info" />
      </button>

      {isOpen && (
        <div className="layout-keyboard-help__backdrop">
          <button
            type="button"
            className="layout-keyboard-help__backdrop-button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={handleClose}
          />
          <div
            ref={dialogRef}
            className="layout-keyboard-help__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t('bed.layout.shortcuts_title')}
          >
            <div className="layout-keyboard-help__header">
              <h3 className="layout-keyboard-help__title">
                {t('bed.layout.shortcuts_title')}
              </h3>
              <Button
                variant="neutral"
                size="sm"
                aria-label={t('bed.layout.shortcuts_close')}
                onClick={handleClose}
              >
                <Icon name="close" decorative />
              </Button>
            </div>

            <ul className="layout-keyboard-help__list">
              <li>{t('bed.layout.shortcut_mode_view')}</li>
              <li>{t('bed.layout.shortcut_mode_position')}</li>
              <li>{t('bed.layout.shortcut_mode_plants')}</li>
              <li>{t('bed.layout.shortcut_tool_pointer')}</li>
              <li>{t('bed.layout.shortcut_tool_single')}</li>
              <li>{t('bed.layout.shortcut_tool_brush')}</li>
              <li>{t('bed.layout.shortcut_delete')}</li>
              <li>{t('bed.layout.shortcut_duplicate')}</li>
              <li>{t('bed.layout.shortcut_escape')}</li>
              <li>{t('bed.layout.shortcut_fit')}</li>
              <li>{t('bed.layout.shortcut_save')}</li>
              <li>{t('bed.layout.shortcut_rotate_bed')}</li>
              <li>{t('bed.layout.shortcut_unplace_bed')}</li>
            </ul>

            <div className="layout-keyboard-help__footer">
              <Button variant="secondary" size="sm" onClick={handleClose}>
                {t('bed.layout.shortcuts_close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
