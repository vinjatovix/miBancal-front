export interface FamilySummary {
  id: string;
  name: string;
  slug: string;
}

export type PlantFamilyRef = string | FamilySummary;
