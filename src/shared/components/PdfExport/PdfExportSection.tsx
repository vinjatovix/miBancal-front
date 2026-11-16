import type { JSX, ReactNode } from 'react';

import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';

export interface PdfExportSectionProps {
  readonly titleKey: I18nKey;
  readonly divided?: boolean;
  readonly children: ReactNode;
}

export default function PdfExportSection({
  titleKey,
  divided = false,
  children
}: PdfExportSectionProps): JSX.Element {
  const className = divided
    ? 'pdf-export-modal__section pdf-export-modal__section--divided'
    : 'pdf-export-modal__section';

  return (
    <section className={className}>
      <h3 className="pdf-export-modal__section-title">{t(titleKey)}</h3>
      {children}
    </section>
  );
}
