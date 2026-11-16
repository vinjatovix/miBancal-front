import type { JSX, ReactNode } from 'react';

import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';

import './pdfExportModal.css';

export interface PdfExportModalLabels {
  readonly title: I18nKey;
  readonly subtitle: I18nKey;
  readonly cancel: I18nKey;
  readonly download: I18nKey;
  readonly generating: I18nKey;
}

export interface PdfExportModalShellProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly labels: PdfExportModalLabels;
  readonly canDownload: boolean;
  readonly isBusy: boolean;
  readonly showSpinner: boolean;
  readonly onDownload: () => void;
  readonly children: ReactNode;
}

export default function PdfExportModalShell({
  isOpen,
  onClose,
  labels,
  canDownload,
  isBusy,
  showSpinner,
  onDownload,
  children
}: PdfExportModalShellProps): JSX.Element {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t(labels.title)}
      subtitle={t(labels.subtitle)}
      icon="save"
      preventClose={isBusy}
      footer={
        <div className="pdf-export-modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={isBusy}>
            {t(labels.cancel)}
          </Button>
          <Button
            variant="primary"
            icon="save"
            onClick={onDownload}
            disabled={!canDownload || isBusy}
          >
            {showSpinner ? t(labels.generating) : t(labels.download)}
          </Button>
        </div>
      }
    >
      {children}
    </Modal>
  );
}
