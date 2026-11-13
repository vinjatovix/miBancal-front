import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePlantFormState } from '../../../../../../src/pages/plants/components/PlantForm/hooks/usePlantFormState';
import { initialPlantFormState } from '../../../../../../src/pages/plants/components/PlantForm/utils/plantFormMappers';

describe('usePlantFormState', () => {
  it('initializes with given initial state and isDirty as false', () => {
    const initial = initialPlantFormState();

    const { result } = renderHook(() => usePlantFormState(initial));

    expect(result.current.values).toEqual(initial);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it('updates field and sets isDirty to true', () => {
    const initial = initialPlantFormState();
    const { result } = renderHook(() => usePlantFormState(initial));

    act(() => {
      result.current.setField('primaryName', 'Tomate');
    });

    expect(result.current.values.primaryName).toBe('Tomate');
    expect(result.current.isDirty).toBe(true);
  });

  it('validates state and populates errors when invalid', () => {
    const initial = initialPlantFormState();
    const { result } = renderHook(() => usePlantFormState(initial));

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.primaryName).toBeDefined();
  });

  it('resets form to initial values and resets isDirty', () => {
    const initial = initialPlantFormState();
    const { result } = renderHook(() => usePlantFormState(initial));

    act(() => {
      result.current.setField('primaryName', 'Zanahoria');
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values.primaryName).toBe('');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.errors).toEqual({});
  });
});
