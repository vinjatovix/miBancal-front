import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PdfExportSection from '../../../../src/shared/components/PdfExport/PdfExportSection';
import { t } from '../../../../src/i18n/core/t';
import '../../../../src/i18n/messages/plant';

const TITLE_KEY = 'plant.export.section_content' as const;

describe('PdfExportSection', () => {
  it('renders the translated title and its children', () => {
    render(
      <PdfExportSection titleKey={TITLE_KEY}>
        <span>section-child</span>
      </PdfExportSection>
    );

    expect(
      screen.getByRole('heading', { name: t(TITLE_KEY) })
    ).toBeInTheDocument();
    expect(screen.getByText('section-child')).toBeInTheDocument();
  });

  it('adds the divider modifier only when divided is set', () => {
    const { container, rerender } = render(
      <PdfExportSection titleKey={TITLE_KEY}>x</PdfExportSection>
    );
    const section = () => container.querySelector('section');

    expect(section()).not.toBeNull();
    expect(
      section()?.classList.contains('pdf-export-modal__section--divided')
    ).toBe(false);

    rerender(
      <PdfExportSection titleKey={TITLE_KEY} divided>
        x
      </PdfExportSection>
    );
    expect(
      section()?.classList.contains('pdf-export-modal__section--divided')
    ).toBe(true);
  });
});
