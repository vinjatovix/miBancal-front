import { afterEach, beforeEach, vi } from 'vitest';

import { exportPlantToPdf } from '../../../src/services/pdf/plantPdfExport.service';
import { buildPlant } from '../../fixtures/plants/buildPlant';
import { buildPlantPdfExportOptions } from '../../fixtures/pdf/buildPlantPdfExport';

const saveMock = vi.fn();
const addPageMock = vi.fn();
const constructorMock = vi.fn();

vi.mock('jspdf', () => ({
  jsPDF: class {
    constructor(options: unknown) {
      constructorMock(options);
    }
    save = saveMock;
    addPage = addPageMock;
    getNumberOfPages = (): number => 1 + addPageMock.mock.calls.length;
    setDrawColor = vi.fn();
    setFillColor = vi.fn();
    setTextColor = vi.fn();
    setLineWidth = vi.fn();
    setFont = vi.fn();
    setFontSize = vi.fn();
    rect = vi.fn();
    line = vi.fn();
    text = vi.fn();
    addImage = vi.fn();
    setPage = vi.fn();
    getTextWidth = vi.fn(() => 5);
    splitTextToSize = vi.fn((text: string) => [text]);
    getImageProperties = vi.fn(() => ({ width: 300, height: 200 }));
  }
}));

describe('exportPlantToPdf', () => {
  beforeEach(() => {
    saveMock.mockClear();
    addPageMock.mockClear();
    constructorMock.mockClear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates an A4 portrait document, saves it and returns the result', async () => {
    const result = await exportPlantToPdf(
      {
        plant: buildPlant({ slug: 'perejil' }),
        options: buildPlantPdfExportOptions()
      },
      new Date(2026, 10, 9)
    );

    expect(constructorMock).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    expect(saveMock).toHaveBeenCalledWith('perejil-2026-11-09.pdf');
    expect(result.success).toBe(true);
    expect(result.filename).toMatch(/^[a-z0-9-]+-\d{4}-\d{2}-\d{2}\.pdf$/);
    expect(result.pageCount).toBeGreaterThanOrEqual(1);
  });

  it('throws empty-pdf-selection when no content section is selected', async () => {
    const options = buildPlantPdfExportOptions({
      includeImage: false,
      includeQuickFacts: false,
      includeCalendar: false,
      includeSafety: false,
      includeCultivation: false,
      includeEcology: false,
      includeNotes: false,
      includeResources: false
    });

    await expect(
      exportPlantToPdf({ plant: buildPlant(), options })
    ).rejects.toThrow('empty-pdf-selection');
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('composes offline without issuing any network request', async () => {
    const fetchSpy = vi.mocked(fetch);

    await exportPlantToPdf(
      {
        plant: buildPlant(),
        options: buildPlantPdfExportOptions({
          imageDataUrl: 'data:image/jpeg;base64,AAAA'
        })
      },
      new Date(2026, 10, 9)
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
