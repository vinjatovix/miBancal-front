import { screen } from '@testing-library/react';

import PlantList from '../../src/pages/plants/PlantList';

import { buildFamilyPlantItem } from '../fixtures/plants/buildFamilyPlantItem';
import { buildPlantListItem } from '../fixtures/plants/buildPlantListItem';
import { listPlantsResponse } from '../fixtures/plants/listPlants';
import { renderWithProviders } from '../test-utils/renderWithProviders';
import { lastRequest, stubFetchOk, API_URL } from '../test-utils/stubFetch';
import {
  assertContractRequest,
  validateRequest,
  validateSchema
} from './openApiContract';

vi.mock('../../src/services/families.service', () => ({
  getFamilyList: vi.fn(() => Promise.resolve([]))
}));

const UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const LONG_TEXT = 'a'.repeat(201);
const DEFAULT_TAIL = 'pagination[page]=1&pagination[limit]=25&sort[name]=asc';
const LIST_FIELDS =
  'fields[plants]=slug,identity,traits,image,status,likesCount';
const firstPlantName = listPlantsResponse.data[0].identity.name.primary;

async function requestFor(pageUrl: string): Promise<string> {
  const fetchMock = stubFetchOk(listPlantsResponse);
  renderWithProviders(<PlantList />, { route: pageUrl });
  await screen.findByText(new RegExp(firstPlantName, 'i'));
  return lastRequest(fetchMock).url;
}

function expected(query: string): string {
  return `${API_URL}/api/v1/plants?${query}&${LIST_FIELDS}`;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('plant list requests conform to contract', () => {
  it.each([
    ['/plants', DEFAULT_TAIL],
    [
      '/plants?sortField=name&sortDirection=asc',
      'pagination[page]=1&pagination[limit]=25&sort[name]=asc'
    ],
    [
      '/plants?sortField=name&sortDirection=desc',
      'pagination[page]=1&pagination[limit]=25&sort[name]=desc'
    ],
    [
      '/plants?sortField=scientificName&sortDirection=asc',
      'pagination[page]=1&pagination[limit]=25&sort[scientificName]=asc'
    ],
    [
      '/plants?sortField=scientificName&sortDirection=desc',
      'pagination[page]=1&pagination[limit]=25&sort[scientificName]=desc'
    ],
    [
      '/plants?page=2&limit=50',
      'pagination[page]=2&pagination[limit]=50&sort[name]=asc'
    ],
    [
      '/plants?limit=100',
      'pagination[page]=1&pagination[limit]=100&sort[name]=asc'
    ],
    [
      '/plants?identity=tomate',
      `filter[identity][contains]=tomate&${DEFAULT_TAIL}`
    ],
    [`/plants?family=${UUID}`, `filter[family][eq]=${UUID}&${DEFAULT_TAIL}`],
    [
      '/plants?lifeCycle=annual',
      `filter[lifeCycle][eq]=annual&${DEFAULT_TAIL}`
    ],
    [
      '/plants?sowingMethod=direct',
      `filter[sowingMethod][eq]=direct&${DEFAULT_TAIL}`
    ],
    [
      '/plants?sowingMonth=3&sowingMonth=5',
      `filter[sowingMonths][hasAny]=3,5&${DEFAULT_TAIL}`
    ],
    ['/plants?soilPh=6.5', `filter[soilPh][eq]=6.5&${DEFAULT_TAIL}`],
    [
      '/plants?soilAvailableDepthCm=30',
      `filter[soilAvailableDepthCm][eq]=30&${DEFAULT_TAIL}`
    ],
    ['/plants?spacingCm=40', `filter[spacingCm][eq]=40&${DEFAULT_TAIL}`],
    [
      '/plants?lightType=full_sun',
      `filter[lightType][eq]=full_sun&${DEFAULT_TAIL}`
    ],
    ['/plants?lightHoursMin=6', `filter[lightHoursMin][eq]=6&${DEFAULT_TAIL}`],
    [
      '/plants?rootSystem=taproot',
      `filter[rootSystem][eq]=taproot&${DEFAULT_TAIL}`
    ],
    [
      `/plants?rootSystem=taproot&lightHoursMin=6&lightType=full_sun&spacingCm=40&soilAvailableDepthCm=30&soilPh=6.5&sowingMonth=3&sowingMethod=direct&lifeCycle=annual&family=${UUID}&identity=tomate&page=2&limit=50&sortField=scientificName&sortDirection=desc`,
      [
        'filter[identity][contains]=tomate',
        `filter[family][eq]=${UUID}`,
        'filter[lifeCycle][eq]=annual',
        'filter[sowingMethod][eq]=direct',
        'filter[sowingMonths][hasAny]=3',
        'filter[soilPh][eq]=6.5',
        'filter[soilAvailableDepthCm][eq]=30',
        'filter[spacingCm][eq]=40',
        'filter[lightType][eq]=full_sun',
        'filter[lightHoursMin][eq]=6',
        'filter[rootSystem][eq]=taproot',
        'pagination[page]=2',
        'pagination[limit]=50',
        'sort[scientificName]=desc'
      ].join('&')
    ]
  ])('%s', async (pageUrl, query) => {
    const url = await requestFor(pageUrl);

    expect(url).toBe(expected(query));
    expect(validateRequest('get', url)).toEqual([]);
    await expect(
      assertContractRequest({ url, method: 'GET', strictParameters: true })
    ).resolves.toBeUndefined();
  });
});

describe('edible and toxic filters conform to contract', () => {
  it.each([
    ['/plants?edible=true', `filter[edible][eq]=true&${DEFAULT_TAIL}`],
    [
      '/plants?edible=true&toxic=false&lifeCycle=annual&page=3',
      [
        'filter[lifeCycle][eq]=annual',
        'filter[edible][eq]=true',
        'filter[toxic][eq]=false',
        'pagination[page]=3',
        'pagination[limit]=25',
        'sort[name]=asc'
      ].join('&')
    ],
    ['/plants?edible=quiza&toxic=FALSE', DEFAULT_TAIL]
  ])('%s', async (pageUrl, query) => {
    const url = await requestFor(pageUrl);

    expect(url).toBe(expected(query));
    expect(validateRequest('get', url)).toEqual([]);
    await expect(
      assertContractRequest({ url, method: 'GET', strictParameters: true })
    ).resolves.toBeUndefined();
  });
});

describe('invalid URLs produce sanitized and conforming requests', () => {
  it.each([
    ['/plants?limit=500', DEFAULT_TAIL],
    ['/plants?limit=37', DEFAULT_TAIL],
    ['/plants?page=0', DEFAULT_TAIL],
    ['/plants?page=-3', DEFAULT_TAIL],
    ['/plants?page=abc', DEFAULT_TAIL],
    ['/plants?page=2.5', DEFAULT_TAIL],
    ['/plants?sortDirection=up', DEFAULT_TAIL],
    ['/plants?sortField=identity.name.primary', DEFAULT_TAIL],
    [
      '/plants?family=rosaceae&lifeCycle=annual',
      `filter[lifeCycle][eq]=annual&${DEFAULT_TAIL}`
    ],
    ['/plants?sowingMonth=13&sowingMonth=0&sowingMonth=3.5', DEFAULT_TAIL],
    [
      '/plants?sowingMonth=3&sowingMonth=13&sowingMonth=5,3',
      `filter[sowingMonths][hasAny]=3,5&${DEFAULT_TAIL}`
    ],
    ['/plants?soilPh=1e3', DEFAULT_TAIL],
    ['/plants?soilPh=abc', DEFAULT_TAIL],
    ['/plants?soilPh=Infinity', DEFAULT_TAIL],
    ['/plants?identity=%20%20', DEFAULT_TAIL],
    [`/plants?identity=${LONG_TEXT}`, DEFAULT_TAIL]
  ])('%s', async (pageUrl, query) => {
    const url = await requestFor(pageUrl);

    expect(url).toBe(expected(query));
    expect(validateRequest('get', url)).toEqual([]);
    await expect(
      assertContractRequest({ url, method: 'GET', strictParameters: true })
    ).resolves.toBeUndefined();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('family detail plants request', () => {
  it('conforms to contract', async () => {
    const url = `${API_URL}/api/v1/plants?filter[family][eq]=${UUID}&sort[name]=asc&fields[plants]=slug,identity,status`;

    expect(validateRequest('get', url)).toEqual([]);
    await expect(
      assertContractRequest({ url, method: 'GET', strictParameters: true })
    ).resolves.toBeUndefined();
  });
});

describe('partial plants from listings conform to PlantFieldset', () => {
  it.each(['ACTIVE', 'DELETED', undefined] as const)(
    'family detail plant with status %s',
    (status) => {
      const item = buildFamilyPlantItem({ status });

      expect(validateSchema('PlantFieldset', item)).toEqual([]);
    }
  );

  it.each(['ACTIVE', 'DELETED', undefined] as const)(
    'listing plant with status %s',
    (status) => {
      const item = buildPlantListItem({ status });

      expect(validateSchema('PlantFieldset', item)).toEqual([]);
    }
  );
});

describe('primary image conforms to PlantImage', () => {
  it.each(listPlantsResponse.data)(
    'image of $identity.name.primary',
    ({ image }) => {
      expect(validateSchema('PlantImage', image)).toEqual([]);
    }
  );

  it('a listed plant without an image violates PlantFieldset', () => {
    const item = { ...buildPlantListItem(), image: null };

    expect(validateSchema('PlantFieldset', item)).not.toEqual([]);
  });
});
