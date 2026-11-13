import { beforeEach, vi } from 'vitest';

import { exportLocationLayoutToPdf } from '../../../src/services/pdf/bedPdfExport.service';
import type { CropPlacementItem } from '../../../src/types/PlantInstance/plantPlacementTypes';
import {
  buildBedPdfExportOptions as buildOptions,
  buildExportLocationPdfParams as buildParams,
  buildResolvedBed
} from '../../fixtures/pdf/buildBedPdfExport';
import { buildCropPlacementItem } from '../../fixtures/plantInstances/buildPlantInstance';

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
    setLineDashPattern = vi.fn();
    setFont = vi.fn();
    setFontSize = vi.fn();
    rect = vi.fn();
    line = vi.fn();
    circle = vi.fn();
    triangle = vi.fn();
    text = vi.fn();
    getTextWidth = vi.fn(() => 5);
  }
}));

describe('exportLocationLayoutToPdf', () => {
  beforeEach(() => {
    saveMock.mockClear();
    addPageMock.mockClear();
    constructorMock.mockClear();
  });

  it('creates a document, saves it and returns the result', async () => {
    const result = await exportLocationLayoutToPdf(
      buildParams(),
      new Date(2026, 10, 9)
    );

    expect(constructorMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith('huerto-norte-2026-11-09.pdf');
    expect(result.success).toBe(true);
    expect(result.pageCount).toBe(2);
  });

  it('adds one page per sheet beyond the first', async () => {
    await exportLocationLayoutToPdf(
      buildParams({
        placedBeds: [buildResolvedBed(), buildResolvedBed({ id: 'bed-2' })],
        options: buildOptions({ selectedBedIds: ['bed-1', 'bed-2'] })
      })
    );

    expect(addPageMock).toHaveBeenCalledTimes(2);
  });

  it('starts the document with the first sheet orientation', async () => {
    await exportLocationLayoutToPdf(
      buildParams({ options: buildOptions({ includeLocationLayout: false }) })
    );

    expect(constructorMock).toHaveBeenCalledWith(
      expect.objectContaining({ orientation: 'landscape', format: 'a4' })
    );
  });

  it('counts the species overflow pages in the reported page count', async () => {
    const crops: CropPlacementItem[] = Array.from({ length: 80 }, (_, index) =>
      buildCropPlacementItem({ id: `crop-${index}`, plantId: `plant-${index}` })
    );

    const result = await exportLocationLayoutToPdf(
      buildParams({
        cropsByBed: new Map([['bed-1', crops]]),
        options: buildOptions({
          includeLocationLayout: false,
          includeBedSheets: false
        })
      })
    );

    expect(result.pageCount).toBeGreaterThan(1);
    expect(result.pageCount).toBe(1 + addPageMock.mock.calls.length);
  });

  it('rejects an empty selection before creating any document', async () => {
    const exportAttempt = exportLocationLayoutToPdf(
      buildParams({
        options: buildOptions({
          includeLocationLayout: false,
          selectedBedIds: []
        })
      })
    );

    await expect(exportAttempt).rejects.toThrow('empty-pdf-selection');
    expect(constructorMock).not.toHaveBeenCalled();
  });
});
