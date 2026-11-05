import { plantKeys } from '../../../src/shared/reactQuery/plantKeys';
import type { PlantListRequest } from '../../../src/services/plantListQuery';

function buildRequest(): PlantListRequest {
  return {
    filters: { lifeCycle: 'annual' },
    pagination: { page: 1, limit: 25 },
    sort: { field: 'name', direction: 'asc' }
  };
}

describe('plantKeys', () => {
  it('agrupa todas las keys de plantas', () => {
    expect(plantKeys.all).toEqual(['plants']);
  });

  it('la key del listado incluye la petición cuando se omite el scope', () => {
    const request = buildRequest();

    expect(plantKeys.list(request)).toEqual(['plants', 'list', request]);
  });

  it.each(['admin', 'public'] as const)(
    'la key del listado incluye explícitamente el scope %s',
    (scope) => {
      const request = buildRequest();

      expect(plantKeys.list(request, scope)).toEqual([
        'plants',
        'list',
        request,
        scope
      ]);
    }
  );

  it('dos peticiones con el mismo contenido y scope producen la misma key', () => {
    const scope = 'admin';

    expect(plantKeys.list(buildRequest(), scope)).toEqual(
      plantKeys.list(buildRequest(), scope)
    );
  });

  it('dos peticiones con el mismo contenido producen la misma key cuando se omite el scope', () => {
    expect(plantKeys.list(buildRequest())).toEqual(
      plantKeys.list(buildRequest())
    );
  });

  it('genera claves de listado distintas para scopes diferentes', () => {
    const request = buildRequest();

    const adminKey = plantKeys.list(request, 'admin');
    const publicKey = plantKeys.list(request, 'public');

    expect(adminKey).not.toEqual(publicKey);
  });

  it('la key del detalle incluye el identificador de la planta cuando se omite el scope', () => {
    const plantId = 'plant-123';

    const key = plantKeys.detail(plantId);

    expect(key).toEqual(['plants', 'detail', plantId]);
  });

  it.each(['admin', 'public'] as const)(
    'la key del detalle incluye explícitamente el scope %s',
    (scope) => {
      const plantId = 'plant-123';

      expect(plantKeys.detail(plantId, scope)).toEqual([
        'plants',
        'detail',
        plantId,
        scope
      ]);
    }
  );

  it('genera claves de detalle distintas para scopes diferentes', () => {
    const plantId = 'plant-123';

    const adminKey = plantKeys.detail(plantId, 'admin');
    const publicKey = plantKeys.detail(plantId, 'public');

    expect(adminKey).not.toEqual(publicKey);
  });

  it('la key de familia incluye el identificador de la familia cuando se omite el scope', () => {
    const familyId = 'family-123';

    const key = plantKeys.family(familyId);

    expect(key).toEqual(['plants', 'family', familyId]);
  });

  it.each(['admin', 'public'] as const)(
    'la key de familia incluye explícitamente el scope %s',
    (scope) => {
      const familyId = 'family-123';

      expect(plantKeys.family(familyId, scope)).toEqual([
        'plants',
        'family',
        familyId,
        scope
      ]);
    }
  );

  it('genera claves de familia distintas para scopes diferentes', () => {
    const familyId = 'family-123';

    const adminKey = plantKeys.family(familyId, 'admin');
    const publicKey = plantKeys.family(familyId, 'public');

    expect(adminKey).not.toEqual(publicKey);
  });
});
