import type { Metadata } from './Metadata';

export interface Family {
  id: string;
  version?: number;
  slug: string;
  name: string;
  aliases: string[];
  scientificName: string;
  shortDescription: string;
  highlights: string[];
  extra?: {
    order?: string;
    subfamilies?: string[];
    distribution?: string;
    speciesCount?: number;
  };
  metadata?: Metadata;
}

export type FamilyListItem = Pick<Family, 'id' | 'name' | 'scientificName'>;

export interface CreateFamilyRequest {
  id: string;
  slug: string;
  name: string;
  scientificName: string;
  shortDescription: string;
  highlights: string[];
  aliases?: string[];
  extra?: {
    order?: string;
    subfamilies?: string[];
    distribution?: string;
    speciesCount?: number;
  };
}

export interface UpdateFamilyRequest {
  slug?: string;
  name?: string;
  scientificName?: string;
  shortDescription?: string;
  highlights?: string[];
  aliases?: string[];
  extra?: {
    order?: string | null;
    subfamilies?: string[] | null;
    distribution?: string | null;
    speciesCount?: number | null;
  } | null;
}
