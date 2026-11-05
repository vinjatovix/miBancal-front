import { screen } from '@testing-library/react';

import PlantFilters from '../../src/components/plants/PlantFilters/PlantFilters';
import FamilyList from '../../src/pages/families/FamilyList';

import { buildFamilyListItem } from '../fixtures/families/buildFamilyListItem';
import { listFamilyItemsResponse } from '../fixtures/families/listFamilyItems';
import { renderWithProviders } from '../test-utils/renderWithProviders';
import { API_URL, lastRequest, stubFetchOk } from '../test-utils/stubFetch';
import {
  assertContractRequest,
  validateRequest,
  validateSchema
} from './openApiContract';

const EXPECTED_URL = `${API_URL}/api/v1/families?pagination[page]=1&pagination[limit]=100&sort[name]=asc&fields[families]=name,scientificName`;
const [firstFamily] = listFamilyItemsResponse.data;

async function requestFor(
  ui: React.ReactNode,
  route: string,
  rendered: () => Promise<HTMLElement>
): Promise<string> {
  const fetchMock = stubFetchOk(listFamilyItemsResponse);
  renderWithProviders(ui, { route });
  await rendered();
  return lastRequest(fetchMock).url;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('family list request conforms to contract', () => {
  it.each([
    [
      '/plants (family selector)',
      <PlantFilters key="plants" />,
      '/plants',
      () => screen.findByRole('option', { name: 'Amarilidáceas' })
    ],
    [
      '/families (list)',
      <FamilyList key="families" />,
      '/families',
      () =>
        screen.findByRole('link', {
          name: new RegExp(firstFamily.scientificName)
        })
    ]
  ])('%s', async (_page, ui, route, rendered) => {
    const url = await requestFor(ui, route, rendered);

    expect(url).toBe(EXPECTED_URL);
    expect(validateRequest('get', url)).toEqual([]);
    await expect(
      assertContractRequest({ url, method: 'GET', strictParameters: true })
    ).resolves.toBeUndefined();
  });
});

describe('partial families in listing conform to FamilyFieldset', () => {
  it.each(listFamilyItemsResponse.data)('family $name', (item) => {
    expect(validateSchema('FamilyFieldset', item)).toEqual([]);
  });

  it('factory', () => {
    expect(validateSchema('FamilyFieldset', buildFamilyListItem())).toEqual([]);
  });

  it('rejects a property not declared in contract', () => {
    const item = { ...buildFamilyListItem(), foo: 'bar' };

    expect(validateSchema('FamilyFieldset', item)).not.toEqual([]);
  });
});
