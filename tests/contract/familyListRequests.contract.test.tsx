import { screen } from '@testing-library/react';

import PlantFilters from '../../src/components/plants/PlantFilters/PlantFilters';
import FamilyList from '../../src/pages/families/FamilyList';

import { buildFamilyListItem } from '../fixtures/families/buildFamilyListItem';
import { listFamilyItemsResponse } from '../fixtures/families/listFamilyItems';
import { renderWithProviders } from '../test-utils/renderWithProviders';
import { API_URL, lastRequest, stubFetchOk } from '../test-utils/stubFetch';
import { validateRequest, validateSchema } from './openApiContract';

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

describe('petición del listado de familias conforme al contrato', () => {
  it.each([
    [
      '/plants (selector de familia)',
      <PlantFilters key="plants" />,
      '/plants',
      () => screen.findByRole('option', { name: 'Amarilidáceas' })
    ],
    [
      '/families (listado)',
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
  });
});

describe('las familias parciales del listado cumplen FamilyFieldset', () => {
  it.each(listFamilyItemsResponse.data)('familia $name', (item) => {
    expect(validateSchema('FamilyFieldset', item)).toEqual([]);
  });

  it('factoría', () => {
    expect(validateSchema('FamilyFieldset', buildFamilyListItem())).toEqual([]);
  });

  it('rechaza una propiedad que el contrato no declara', () => {
    const item = { ...buildFamilyListItem(), foo: 'bar' };

    expect(validateSchema('FamilyFieldset', item)).not.toEqual([]);
  });
});
