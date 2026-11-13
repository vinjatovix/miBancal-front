import {
  assertContractRequest,
  assertContractResponse,
  validateRequest,
  validateSchema
} from './openApiContract';

const VALID_LIST_URL =
  '/api/v1/plants?pagination[page]=1&pagination[limit]=25&sort[name]=asc';

function locations(method: 'get', url: string): string[] {
  return validateRequest(method, url).map((violation) => violation.location);
}

describe('validateRequest', () => {
  it('a plant list request conforming to contract has no violations', () => {
    expect(validateRequest('get', VALID_LIST_URL)).toEqual([]);
  });

  it('accepts an absolute URL with origin and fragment', () => {
    expect(
      validateRequest('get', 'https://x.test/api/v1/plants?sort[name]=asc#a')
    ).toEqual([]);
  });

  it('accepts an encoded URL', () => {
    expect(validateRequest('get', '/api/v1/plants?sort%5Bname%5D=asc')).toEqual(
      []
    );
  });

  it('validates repeated keys as a list', () => {
    expect(
      validateRequest(
        'get',
        '/api/v1/plants?filter[sowingMonths][hasAny]=3&filter[sowingMonths][hasAny]=5'
      )
    ).toEqual([]);
  });

  it('an undeclared route is a path violation', () => {
    expect(locations('get', '/api/v1/plantas')).toEqual(['path']);
  });

  it('an undeclared method is a path violation', () => {
    expect(validateRequest('delete', '/api/v1/plants')).toEqual([
      expect.objectContaining({ location: 'path' })
    ]);
  });

  it('an undeclared query parameter is a violation', () => {
    expect(locations('get', '/api/v1/plants?orderBy=name')).toContain(
      'query.orderBy'
    );
  });

  it('a deepObject parameter without brackets is a violation', () => {
    expect(locations('get', '/api/v1/plants?sort=name')).toContain(
      'query.sort'
    );
  });

  it.each([
    ['sort[identity.name.primary]=asc', 'query.sort'],
    ['pagination[limit]=101', 'query.pagination'],
    ['filter[family][eq]=rosaceae', 'query.filter'],
    ['filter[soilPh][eq]=1e3', 'query.filter']
  ])('%s does not conform to schema (%s)', (query, prefix) => {
    const found = locations('get', `/api/v1/plants?${query}`);

    expect(found.length).toBeGreaterThan(0);
    expect(found.every((location) => location.startsWith(prefix))).toBe(true);
  });
});

describe('validateSchema', () => {
  it('validates a valid FamilySummary without violations', () => {
    const summary = {
      id: 'fa821c9a-9e12-4c28-98e3-533bbbe114e2',
      name: 'Solanáceas',
      slug: 'solanaceae'
    };

    const violations = validateSchema('FamilySummary', summary);

    expect(violations).toEqual([]);
  });

  it('rejects additional properties in FamilySummary', () => {
    const summaryWithExtra = {
      id: 'fa821c9a-9e12-4c28-98e3-533bbbe114e2',
      name: 'Solanáceas',
      slug: 'solanaceae',
      extraProperty: 'not-allowed'
    };

    const violations = validateSchema('FamilySummary', summaryWithExtra);

    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].location).toContain('extraProperty');
  });

  it.each([
    [
      'FamilySummary',
      {
        id: 'fa821c9a-9e12-4c28-98e3-533bbbe114e2',
        name: 'Solanáceas',
        slug: 'solanaceae'
      }
    ],
    ['string id', 'fa821c9a-9e12-4c28-98e3-533bbbe114e2']
  ])('validates PlantIdentityView with family as %s', (_, family) => {
    const identity = {
      name: {
        primary: 'Tomate',
        aliases: []
      },
      scientificName: 'Solanum lycopersicum',
      family
    };

    const violations = validateSchema('PlantIdentityView', identity);

    expect(violations).toEqual([]);
  });

  it('rejects PlantIdentityView without required fields', () => {
    const invalidIdentity = {
      name: {
        primary: 'Tomate'
      }
    };

    const violations = validateSchema('PlantIdentityView', invalidIdentity);

    expect(violations.length).toBeGreaterThan(0);
  });

  it.each([
    [0.5, true],
    [0, false]
  ])(
    'reads boolean exclusiveMinimum from OpenAPI 3.0: frequencyPerYear %s valid = %s',
    (frequencyPerYear, isValid) => {
      const pruning = {
        type: 'formación',
        intensity: 'ligera',
        seasons: ['winter'],
        frequencyPerYear
      };

      const violations = validateSchema('PruningEntry', pruning);

      expect(violations.length === 0).toBe(isValid);
    }
  );
});

describe('assertContractRequest', () => {
  it('accepts a valid plant list query matching contract', async () => {
    const requestInput = {
      url: VALID_LIST_URL,
      method: 'GET',
      strictParameters: true
    };

    const assertion = assertContractRequest(requestInput);

    await expect(assertion).resolves.toBeUndefined();
  });

  it('accepts a valid request passed as a standard Request object', async () => {
    const request = new Request('http://localhost/api/v1/auth/refresh', {
      method: 'POST'
    });

    const assertion = assertContractRequest({ request });

    await expect(assertion).resolves.toBeUndefined();
  });

  it('accepts a valid request passed in req object shape', async () => {
    const req = {
      url: 'http://localhost/api/v1/bookmarks/plants',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plantId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' })
    };

    const assertion = assertContractRequest({ req });

    await expect(assertion).resolves.toBeUndefined();
  });

  it('rejects an undeclared route', async () => {
    const requestInput = {
      path: '/api/v1/nonexistent',
      method: 'GET'
    };

    const assertion = assertContractRequest(requestInput);

    await expect(assertion).rejects.toThrow();
  });

  it.each([
    ['undeclared query param', '/api/v1/plants?orderBy=name'],
    ['invalid pagination limit', '/api/v1/plants?pagination[limit]=101'],
    ['invalid uuid filter', '/api/v1/plants?filter[family][eq]=rosaceae'],
    ['invalid numeric filter pattern', '/api/v1/plants?filter[soilPh][eq]=1e3']
  ])('rejects %s with strict parameters', async (_desc, url) => {
    const assertion = assertContractRequest({
      url,
      method: 'GET',
      strictParameters: true
    });

    await expect(assertion).rejects.toThrow();
  });
});

describe('assertContractResponse', () => {
  it('accepts a valid response matching contract schema', async () => {
    const responseInput = {
      path: '/api/v1/bookmarks',
      method: 'GET',
      status: 200,
      body: { plants: [] },
      contentType: 'application/json'
    };

    const assertion = assertContractResponse(responseInput);

    await expect(assertion).resolves.toBeUndefined();
  });

  it('rejects a response with missing required fields', async () => {
    const responseInput = {
      path: '/api/v1/bookmarks',
      method: 'GET',
      status: 200,
      body: { data: [] },
      contentType: 'application/json'
    };

    const assertion = assertContractResponse(responseInput);

    await expect(assertion).rejects.toThrow();
  });
});
