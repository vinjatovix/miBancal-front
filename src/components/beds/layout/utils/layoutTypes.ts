import type { BedPosition } from '../../../../types/Location/LocationLayout';
import type { BedGridLayerKey } from '../../visualizer/utils/bedGridConfig';
import type { PlantingToolMode } from '../../../../types/PlantInstance/brushSelectionTypes';

export type LayoutMode = 'read' | 'position' | 'plants';

export type { PlantingToolMode };

export type GridLayerKey = BedGridLayerKey;

export interface AnchorPoint {
  readonly x: number;
  readonly y: number;
}

export type FloatingAnchorKind = 'bed' | 'crops';

export interface FloatingActionAnchor {
  readonly point: AnchorPoint | null;
  readonly kind: FloatingAnchorKind | null;
}

export interface ResolvedBed {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly position: BedPosition;
  readonly rotation: number;
}

export interface DraftPlacement {
  readonly position: BedPosition | null;
  readonly rotation: number;
}
