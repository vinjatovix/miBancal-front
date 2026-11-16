import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';

export interface PdfExportCheckboxProps {
  readonly labelKey: I18nKey;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onChange: () => void;
}

export default function PdfExportCheckbox({
  labelKey,
  checked,
  disabled,
  onChange
}: PdfExportCheckboxProps): JSX.Element {
  return (
    <label className="pdf-export-modal__option">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span>{t(labelKey)}</span>
    </label>
  );
}
