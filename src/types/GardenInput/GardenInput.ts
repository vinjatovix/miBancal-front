import type { Metadata } from '../Metadata';
import type { SupportResource } from '../SupportResource';

export const GARDEN_INPUT_CATEGORIES = [
  'defense',
  'fertilizer',
  'biostimulant',
  'soil_amendment'
] as const;

export type GardenInputCategory = (typeof GARDEN_INPUT_CATEGORIES)[number];

export const GARDEN_INPUT_ACTIONS = [
  'fungicide',
  'insecticide',
  'repellent',
  'nematicide',
  'fertilizer',
  'biostimulant',
  'rooting',
  'compost_activator'
] as const;

export type GardenInputAction = (typeof GARDEN_INPUT_ACTIONS)[number];

export const DOSAGE_METHODS = [
  'foliar',
  'irrigation',
  'soil',
  'soaking',
  'dusting',
  'other'
] as const;

export type DosageMethod = (typeof DOSAGE_METHODS)[number];

export const GARDEN_INPUT_STATUSES = ['active', 'deleted'] as const;

export type GardenInputStatus = (typeof GARDEN_INPUT_STATUSES)[number];

export interface Ingredient {
  item: string;
  quantity: string;
}

export interface Dosage {
  method: DosageMethod;
  dilution: string;
  frequency: string;
}

export interface Storage {
  duration: string;
  conditions: string;
  spoilageSigns?: string;
}

export interface Recipe {
  name: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  brewTime?: string;
  dosage: Dosage;
  storage?: Storage;
  safetyNotes?: string[];
}

export interface GardenInput {
  id: string;
  version: number;
  slug: string;
  name: string;
  category: GardenInputCategory;
  status: GardenInputStatus;
  metadata: Metadata;
  description?: string;
  actions?: GardenInputAction[];
  activeIngredients?: string[];
  nutrients?: string[];
  targets?: string[];
  recipes?: Recipe[];
  resources?: SupportResource[];
  deletedAt?: string;
}

export type GardenInputListItem = Pick<
  GardenInput,
  | 'id'
  | 'slug'
  | 'name'
  | 'category'
  | 'actions'
  | 'description'
  | 'status'
  | 'deletedAt'
>;

export interface CreateGardenInputRequest {
  id: string;
  slug: string;
  name: string;
  category: GardenInputCategory;
  description?: string;
  actions?: GardenInputAction[];
  activeIngredients?: string[];
  nutrients?: string[];
  targets?: string[];
  recipes?: Recipe[];
  resources?: SupportResource[];
}

export interface UpdateGardenInputRequest {
  name?: string;
  category?: GardenInputCategory;
  description?: string | null;
  actions?: GardenInputAction[] | null;
  activeIngredients?: string[] | null;
  nutrients?: string[] | null;
  targets?: string[] | null;
  recipes?: Recipe[] | null;
  resources?: SupportResource[] | null;
}
