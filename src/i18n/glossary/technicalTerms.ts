export interface TechnicalTerm {
  readonly match: string;
  readonly glossaryKey: string;
  readonly variants?: readonly string[];
}

export const TECHNICAL_TERMS: readonly TechnicalTerm[] = [
  {
    match: 'edafoclimatico',
    glossaryKey: 'edaphoclimatic',
    variants: ['edafoclimaticos', 'edafoclimatica', 'edafoclimaticas']
  },
  {
    match: 'fenologia',
    glossaryKey: 'phenology',
    variants: ['fenologico', 'fenologica', 'fenologicos', 'fenologicas']
  },
  {
    match: 'polinizacion',
    glossaryKey: 'pollination',
    variants: ['polinizaciones', 'polinizador', 'polinizadores', 'polinizar']
  }
];
