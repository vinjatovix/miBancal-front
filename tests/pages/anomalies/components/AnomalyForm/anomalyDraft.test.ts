import { beforeEach, describe, expect, it } from 'vitest';

import type { AnomalyFormState } from '../../../../../src/pages/anomalies/components/AnomalyForm/types';
import {
  clearAnomalyDraft,
  loadAnomalyDraft,
  saveAnomalyDraft
} from '../../../../../src/pages/anomalies/components/AnomalyForm/utils/anomalyDraft';
import { initialAnomalyFormState } from '../../../../../src/pages/anomalies/components/AnomalyForm/utils/anomalyFormMappers';

const DRAFT_KEY = 'anomaly:create-draft';

describe('anomalyDraft', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('saves and restores full state including multimedia resources and confusedWithInput', () => {
    const state: AnomalyFormState = {
      ...initialAnomalyFormState(),
      slug: 'pulgon-verde',
      name: 'Pulgón verde',
      category: 'pest',
      images: [
        {
          id: '1',
          url: 'https://images.example.com/pulgon.jpg',
          title: 'Detalle',
          source: 'INIA'
        }
      ],
      videoResources: [
        {
          id: '2',
          url: 'https://www.youtube.com/watch?v=123',
          title: 'Vídeo'
        }
      ],
      articleResources: [
        {
          id: '3',
          url: 'https://example.com/doc',
          title: 'Artículo'
        }
      ],
      confusedWithInput: 'pulgon-negro\nmosca-blanca'
    };

    saveAnomalyDraft(state);
    const restored = loadAnomalyDraft();

    expect(restored).toEqual(state);
  });

  it('restores legacy drafts defaulting missing resource arrays to empty arrays and confusedWithInput to empty string', () => {
    const legacyDraft = {
      ...initialAnomalyFormState(),
      slug: 'pulgon-verde',
      name: 'Pulgón verde',
      category: 'pest'
    };
    delete (legacyDraft as Partial<AnomalyFormState>).images;
    delete (legacyDraft as Partial<AnomalyFormState>).videoResources;
    delete (legacyDraft as Partial<AnomalyFormState>).articleResources;
    delete (legacyDraft as Partial<AnomalyFormState>).confusedWithInput;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(legacyDraft));

    const restored = loadAnomalyDraft();

    expect(restored).not.toBeNull();
    expect(restored?.images).toEqual([]);
    expect(restored?.videoResources).toEqual([]);
    expect(restored?.articleResources).toEqual([]);
    expect(restored?.confusedWithInput).toBe('');
  });

  it('returns null when draft in sessionStorage is invalid JSON', () => {
    sessionStorage.setItem(DRAFT_KEY, 'invalid-json{');

    const restored = loadAnomalyDraft();

    expect(restored).toBeNull();
  });

  it('clears draft from sessionStorage', () => {
    const state = initialAnomalyFormState();
    saveAnomalyDraft(state);

    clearAnomalyDraft();

    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});
