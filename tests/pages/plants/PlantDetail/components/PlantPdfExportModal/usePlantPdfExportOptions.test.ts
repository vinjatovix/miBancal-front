import { act, renderHook } from '@testing-library/react';

import { usePlantPdfExportOptions } from '../../../../../../src/pages/plants/PlantDetail/components/PlantPdfExportModal/usePlantPdfExportOptions';

describe('usePlantPdfExportOptions', () => {
  it('marks every section when the modal opens', () => {
    const { result } = renderHook(() => usePlantPdfExportOptions(true));

    expect(result.current.options).toMatchObject({
      includeImage: true,
      includeQuickFacts: true,
      includeCalendar: true,
      includeSafety: true,
      includeCultivation: true,
      includeEcology: true,
      includeNotes: true,
      includeResources: true,
      imageDataUrl: null
    });
    expect(result.current.canDownload).toBe(true);
  });

  it('toggles a single section without touching the others', () => {
    const { result } = renderHook(() => usePlantPdfExportOptions(true));

    act(() => result.current.toggleSection('notes'));

    expect(result.current.options.includeNotes).toBe(false);
    expect(result.current.options.includeQuickFacts).toBe(true);
  });

  it('disables downloading when no content section is marked', () => {
    const { result } = renderHook(() => usePlantPdfExportOptions(true));

    act(() => {
      result.current.toggleSection('image');
      result.current.toggleSection('quickFacts');
      result.current.toggleSection('calendar');
      result.current.toggleSection('safety');
      result.current.toggleSection('cultivation');
      result.current.toggleSection('ecology');
      result.current.toggleSection('notes');
      result.current.toggleSection('resources');
    });

    expect(result.current.canDownload).toBe(false);
  });

  it('resets the selection when the modal is reopened', () => {
    const { result, rerender } = renderHook(
      ({ open }) => usePlantPdfExportOptions(open),
      { initialProps: { open: true } }
    );

    act(() => result.current.toggleSection('notes'));
    rerender({ open: false });
    rerender({ open: true });

    expect(result.current.options.includeNotes).toBe(true);
  });
});
