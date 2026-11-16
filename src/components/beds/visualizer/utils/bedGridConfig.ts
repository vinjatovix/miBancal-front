export type BedGridLayerKey = 'sfg' | 'intermediate' | 'decimeters' | 'fine';

export interface BedGridLayerConfig {
  readonly key: BedGridLayerKey;
  readonly step: number;
  readonly defaultEnabled: boolean;
  readonly labelKey: string;
  readonly hintKey: string;
  readonly strokeColor: string;
  readonly strokeWidth: number;
  readonly strokeDasharray?: string;
}

export const BED_GRID_LAYERS: readonly BedGridLayerConfig[] = [
  {
    key: 'sfg',
    step: 30,
    defaultEnabled: true,
    labelKey: 'bed.grids.sfg',
    hintKey: 'bed.grids.sfg_hint',
    strokeColor: 'var(--bed-grid-sfg)',
    strokeWidth: 1.25
  },
  {
    key: 'intermediate',
    step: 15,
    defaultEnabled: false,
    labelKey: 'bed.grids.intermediate',
    hintKey: 'bed.grids.intermediate_hint',
    strokeColor: 'var(--bed-grid-intermediate)',
    strokeWidth: 0.85,
    strokeDasharray: '4,3'
  },
  {
    key: 'decimeters',
    step: 10,
    defaultEnabled: false,
    labelKey: 'bed.grids.decimeters',
    hintKey: 'bed.grids.decimeters_hint',
    strokeColor: 'var(--bed-grid-decimeters)',
    strokeWidth: 0.8,
    strokeDasharray: '3,3'
  },
  {
    key: 'fine',
    step: 5,
    defaultEnabled: false,
    labelKey: 'bed.grids.fine',
    hintKey: 'bed.grids.fine_hint',
    strokeColor: 'var(--bed-grid-fine)',
    strokeWidth: 0.5,
    strokeDasharray: '1.5,2.5'
  }
];

export type ActiveGridLayers = Record<BedGridLayerKey, boolean>;

export const DEFAULT_ACTIVE_GRID_LAYERS: ActiveGridLayers = {
  sfg: true,
  intermediate: false,
  decimeters: false,
  fine: false
};

export const DEFAULT_ACTIVE_LAYERS = DEFAULT_ACTIVE_GRID_LAYERS;
