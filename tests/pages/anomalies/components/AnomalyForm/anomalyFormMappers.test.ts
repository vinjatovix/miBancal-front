import { describe, expect, it, vi } from 'vitest';

import type { AnomalyFormState } from '../../../../../src/pages/anomalies/components/AnomalyForm/types';
import {
  anomalyToFormState,
  formStateToCreateAnomalyRequest,
  formStateToUpdateAnomalyRequest,
  initialAnomalyFormState,
  normalizeAnomalyApiErrors
} from '../../../../../src/pages/anomalies/components/AnomalyForm/utils/anomalyFormMappers';
import { buildAnomaly } from '../../../../fixtures/anomalies/buildAnomaly';

function validState(
  overrides: Partial<AnomalyFormState> = {}
): AnomalyFormState {
  return {
    ...initialAnomalyFormState(),
    slug: 'pulgon-verde',
    name: 'Pulgón verde',
    category: 'pest',
    ...overrides
  };
}

describe('anomalyFormMappers', () => {
  describe('initialAnomalyFormState', () => {
    it('initializes resources as empty arrays and confusedWithInput as empty string', () => {
      const state = initialAnomalyFormState();

      expect(state.images).toEqual([]);
      expect(state.videoResources).toEqual([]);
      expect(state.articleResources).toEqual([]);
      expect(state.confusedWithInput).toBe('');
      expect(state.name).toBe('');
      expect(state.slug).toBe('');
    });
  });

  describe('anomalyToFormState', () => {
    it('maps domain resources and confusedWith to form items and multiline string', () => {
      const anomaly = buildAnomaly({
        resources: [
          {
            type: 'image',
            url: 'https://example.com/pulgon.jpg',
            title: 'Detalle',
            source: 'INIA'
          },
          {
            type: 'video',
            url: 'https://www.youtube.com/watch?v=123',
            title: 'Vídeo'
          },
          {
            type: 'article',
            url: 'https://example.com/art',
            title: 'Artículo'
          }
        ],
        confusedWith: ['pulgon-negro', 'mosca-blanca']
      });

      const state = anomalyToFormState(anomaly);

      expect(state.images).toHaveLength(1);
      expect(state.images[0].url).toBe('https://example.com/pulgon.jpg');
      expect(state.images[0].title).toBe('Detalle');
      expect(state.images[0].source).toBe('INIA');
      expect(state.videoResources).toHaveLength(1);
      expect(state.videoResources[0].url).toBe(
        'https://www.youtube.com/watch?v=123'
      );
      expect(state.articleResources).toHaveLength(1);
      expect(state.articleResources[0].url).toBe('https://example.com/art');
      expect(state.confusedWithInput).toBe('pulgon-negro\nmosca-blanca');
    });

    it('sets empty defaults when resources and confusedWith are undefined', () => {
      const anomaly = buildAnomaly({
        resources: undefined,
        confusedWith: undefined
      });

      const state = anomalyToFormState(anomaly);

      expect(state.images).toEqual([]);
      expect(state.videoResources).toEqual([]);
      expect(state.articleResources).toEqual([]);
      expect(state.confusedWithInput).toBe('');
    });
  });

  describe('formStateToCreateAnomalyRequest', () => {
    it('maps valid resources and confusedWith to creation payload', () => {
      const state = validState({
        images: [
          {
            id: '1',
            url: '  https://example.com/foto.jpg  ',
            title: 'Foto',
            source: 'INIA'
          },
          { id: '2', url: '   ', title: '', source: '' }
        ],
        videoResources: [
          {
            id: '3',
            url: 'https://www.youtube.com/watch?v=v1',
            title: 'Video'
          }
        ],
        articleResources: [
          { id: '4', url: 'https://example.com/doc', title: '' }
        ],
        confusedWithInput: '  pulgon-negro \n\n mosca-blanca \n pulgon-negro '
      });

      const request = formStateToCreateAnomalyRequest(state, 'fixed-id');

      expect(request.resources).toEqual([
        {
          type: 'image',
          url: 'https://example.com/foto.jpg',
          title: 'Foto',
          source: 'INIA'
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/watch?v=v1',
          title: 'Video'
        },
        {
          type: 'article',
          url: 'https://example.com/doc'
        }
      ]);
      expect(request.confusedWith).toEqual(['pulgon-negro', 'mosca-blanca']);
    });

    it('omits resources and confusedWith when none are provided', () => {
      const state = validState();

      const request = formStateToCreateAnomalyRequest(state, 'fixed-id');

      expect(request).not.toHaveProperty('resources');
      expect(request).not.toHaveProperty('confusedWith');
    });

    it('generates random UUID when id is not provided', () => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(
        '22222222-2222-4222-8222-222222222222'
      );
      const state = validState();

      const request = formStateToCreateAnomalyRequest(state);

      expect(request.id).toBe('22222222-2222-4222-8222-222222222222');
    });
  });

  describe('formStateToUpdateAnomalyRequest', () => {
    it('returns empty object when no changes are present', () => {
      const initial = anomalyToFormState(
        buildAnomaly({
          resources: [
            {
              type: 'image',
              url: 'https://example.com/foto.jpg',
              title: 'Foto'
            }
          ],
          confusedWith: ['pulgon-negro']
        })
      );

      const patch = formStateToUpdateAnomalyRequest({ ...initial }, initial);

      expect(patch).toEqual({});
    });

    it('sends updated resources and confusedWith when modified', () => {
      const initial = anomalyToFormState(buildAnomaly());
      const state = {
        ...initial,
        images: [
          {
            id: '1',
            url: 'https://example.com/nueva-foto.jpg',
            title: 'Nueva',
            source: ''
          }
        ],
        confusedWithInput: 'cochinilla-algodonosa'
      };

      const patch = formStateToUpdateAnomalyRequest(state, initial);

      expect(patch.resources).toEqual([
        {
          type: 'image',
          url: 'https://example.com/nueva-foto.jpg',
          title: 'Nueva'
        }
      ]);
      expect(patch.confusedWith).toEqual(['cochinilla-algodonosa']);
    });

    it('sends null for resources and confusedWith when lists are completely cleared', () => {
      const initial = anomalyToFormState(
        buildAnomaly({
          resources: [
            {
              type: 'image',
              url: 'https://example.com/foto.jpg'
            }
          ],
          confusedWith: ['pulgon-negro']
        })
      );
      const state = {
        ...initial,
        images: [],
        videoResources: [],
        articleResources: [],
        confusedWithInput: ''
      };

      const patch = formStateToUpdateAnomalyRequest(state, initial);

      expect(patch.resources).toBeNull();
      expect(patch.confusedWith).toBeNull();
    });
  });

  describe('normalizeAnomalyApiErrors', () => {
    it('maps field errors and groups unmapped errors', () => {
      const { fieldErrors, unmappedErrors } = normalizeAnomalyApiErrors({
        name: 'requerido',
        'resources[0].url': 'url invalida',
        confusedWith: 'slug repetido',
        unknownKey: 'error general'
      });

      expect(fieldErrors).toEqual({
        name: 'requerido',
        resources: 'url invalida',
        confusedWith: 'slug repetido'
      });
      expect(unmappedErrors).toEqual(['error general']);
    });
  });
});
