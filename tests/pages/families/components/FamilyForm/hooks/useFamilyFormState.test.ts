import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useFamilyFormState } from '../../../../../../src/pages/families/components/FamilyForm/hooks/useFamilyFormState';
import { initialFamilyFormState } from '../../../../../../src/pages/families/components/FamilyForm/utils/familyFormMappers';

describe('useFamilyFormState', () => {
  it('initializes with given initial state and isDirty as false', () => {
    const initial = initialFamilyFormState();

    const { result } = renderHook(() => useFamilyFormState(initial));

    expect(result.current.values).toEqual(initial);
    expect(result.current.isDirty).toBe(false);
  });

  it('auto-generates slug from scientificName when slug was not manually edited', () => {
    const initial = initialFamilyFormState();
    const { result } = renderHook(() => useFamilyFormState(initial));

    act(() => {
      result.current.setField('scientificName', 'Solanaceae');
    });

    expect(result.current.values.slug).toBe('solanaceae');
  });

  it('preserves manual slug override when scientificName changes later', () => {
    const initial = initialFamilyFormState();
    const { result } = renderHook(() => useFamilyFormState(initial));

    act(() => {
      result.current.setField('slug', 'mi-slug-personalizado');
    });
    act(() => {
      result.current.setField('scientificName', 'Solanaceae');
    });

    expect(result.current.values.slug).toBe('mi-slug-personalizado');
  });

  it('tracks isDirty and resets when resetForm is invoked', () => {
    const initial = initialFamilyFormState();
    const { result } = renderHook(() => useFamilyFormState(initial));

    act(() => {
      result.current.setField('name', 'Solanáceas');
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.values.name).toBe('');
  });
});
