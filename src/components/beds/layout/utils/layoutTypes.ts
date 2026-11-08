import type { BedPosition } from '../../../../types/Location/LocationLayout';

export type LayoutMode = 'read' | 'position' | 'plants';

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
