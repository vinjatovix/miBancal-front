export interface Location {
  readonly id: string;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly version?: number;
}

export interface CreateLocationRequest {
  readonly id: string;
  readonly name: string;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
}

export interface UpdateLocationRequest {
  readonly name?: string;
  readonly latitude?: number;
  readonly longitude?: number;
}
