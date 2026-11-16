import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import PdfExportCheckbox from '../../../../src/shared/components/PdfExport/PdfExportCheckbox';
import { t } from '../../../../src/i18n/core/t';
import '../../../../src/i18n/messages/plant';

const LABEL_KEY = 'plant.export.option_notes' as const;

describe('PdfExportCheckbox', () => {
  it('renders the translated label and the checked state', () => {
    render(
      <PdfExportCheckbox
        labelKey={LABEL_KEY}
        checked
        disabled={false}
        onChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: t(LABEL_KEY) });
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeEnabled();
  });

  it('invokes onChange when the user toggles it', async () => {
    const onChange = vi.fn();
    render(
      <PdfExportCheckbox
        labelKey={LABEL_KEY}
        checked={false}
        disabled={false}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does not fire onChange while disabled', async () => {
    const onChange = vi.fn();
    render(
      <PdfExportCheckbox
        labelKey={LABEL_KEY}
        checked={false}
        disabled
        onChange={onChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    await userEvent.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });
});
