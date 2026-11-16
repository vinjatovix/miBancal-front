import { buildPdfPayload } from '../../../src/services/pdf/bedPdfPayloadBuilder';
import type { CropPlacementItem } from '../../../src/types/PlantInstance/plantPlacementTypes';
import {
  buildBedPdfExportOptions as buildOptions,
  buildExportLocationPdfParams as buildParams,
  buildResolvedBed
} from '../../fixtures/pdf/buildBedPdfExport';
import { buildCropPlacementItem } from '../../fixtures/plantInstances/buildPlantInstance';

describe('buildPdfPayload', () => {
  it('derives filename, location name and generation date', () => {
    const date = new Date(2026, 10, 9);

    const payload = buildPdfPayload(buildParams(), date);

    expect(payload.filename).toBe('huerto-norte-2026-11-09.pdf');
    expect(payload.locationName).toBe('Huerto Norte');
    expect(payload.generationDate).toBe(date);
  });

  it('builds a location overview with union bounds and orientation', () => {
    const params = buildParams({
      placedBeds: [
        buildResolvedBed({ id: 'bed-1', position: { x: 0, y: 0 } }),
        buildResolvedBed({
          id: 'bed-2',
          position: { x: 500, y: 100 },
          width: 100,
          height: 100
        })
      ],
      options: buildOptions({ selectedBedIds: ['bed-1', 'bed-2'] })
    });

    const payload = buildPdfPayload(params);

    expect(payload.locationOverview).not.toBeNull();
    expect(payload.locationOverview?.beds).toHaveLength(2);
    expect(payload.locationOverview?.bounds).toEqual({
      minX: 0,
      minY: 0,
      maxX: 600,
      maxY: 200
    });
    expect(payload.locationOverview?.orientation).toBe('landscape');
  });

  it('omits the overview when the option is disabled', () => {
    const payload = buildPdfPayload(
      buildParams({ options: buildOptions({ includeLocationLayout: false }) })
    );

    expect(payload.locationOverview).toBeNull();
  });

  it('builds bed sheets only for selected beds with consolidated species', () => {
    const crops = [
      buildCropPlacementItem({ id: 'c1', bedId: 'bed-1', plantId: 'tomato' }),
      buildCropPlacementItem({ id: 'c2', bedId: 'bed-1', plantId: 'tomato' })
    ];
    const cropsByBed = new Map<string, readonly CropPlacementItem[]>([
      ['bed-1', crops],
      ['bed-2', []]
    ]);
    const params = buildParams({
      placedBeds: [
        buildResolvedBed({ id: 'bed-1' }),
        buildResolvedBed({ id: 'bed-2', name: 'Bancal Este' })
      ],
      cropsByBed,
      options: buildOptions({ selectedBedIds: ['bed-1'] })
    });

    const payload = buildPdfPayload(params);

    expect(payload.bedSheets).toHaveLength(1);
    expect(payload.bedSheets[0]).toMatchObject({
      bedId: 'bed-1',
      bedName: 'Bancal Sur',
      locationName: 'Huerto Norte',
      orientation: 'landscape',
      isEmpty: false
    });
    expect(payload.bedSheets[0].speciesSummary).toHaveLength(1);
    expect(payload.bedSheets[0].markers).toHaveLength(2);
  });

  it('flags a selected bed without crops as empty', () => {
    const params = buildParams({
      cropsByBed: new Map(),
      options: buildOptions({ selectedBedIds: ['bed-1'] })
    });

    const payload = buildPdfPayload(params);

    expect(payload.bedSheets[0].isEmpty).toBe(true);
    expect(payload.bedSheets[0].speciesSummary).toEqual([]);
  });

  it('produces no bed sheets when both bed sheets and plant list are disabled', () => {
    const payload = buildPdfPayload(
      buildParams({
        options: buildOptions({
          includeBedSheets: false,
          includePlantList: false
        })
      })
    );

    expect(payload.bedSheets).toEqual([]);
  });

  it('still builds bed sheets when only the plant list is requested', () => {
    const payload = buildPdfPayload(
      buildParams({
        options: buildOptions({
          includeBedSheets: false,
          includePlantList: true
        })
      })
    );

    expect(payload.bedSheets).toHaveLength(1);
  });

  it('offsets bed north angle by the bed rotation', () => {
    const params = buildParams({
      placedBeds: [buildResolvedBed({ rotation: 90 })],
      effectiveNorthAngle: 30
    });

    const payload = buildPdfPayload(params);

    expect(payload.bedSheets[0].northAngle).toBe(-60);
  });

  it('derives the bed azimuth as the net cardinal orientation of the bed', () => {
    const params = buildParams({
      placedBeds: [buildResolvedBed({ rotation: 90 })],
      effectiveNorthAngle: 30
    });

    const payload = buildPdfPayload(params);

    expect(payload.bedSheets[0].bedAzimuth).toBe(120);
  });

  it('leaves the bed azimuth null when the location has no north angle', () => {
    const params = buildParams({
      placedBeds: [buildResolvedBed({ rotation: 90 })],
      effectiveNorthAngle: null
    });

    const payload = buildPdfPayload(params);

    expect(payload.bedSheets[0].bedAzimuth).toBeNull();
    expect(payload.bedSheets[0].northAngle).toBeNull();
  });
});
