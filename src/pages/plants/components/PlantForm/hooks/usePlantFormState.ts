import { useCallback, useState } from 'react';
import type { PlantFormState } from '../types';
import { validatePlantForm } from '../utils/validatePlantForm';

export function usePlantFormState(initialState: PlantFormState) {
  const [values, setValues] = useState<PlantFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const setField = useCallback(
    <K extends keyof PlantFormState>(field: K, value: PlantFormState[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const resetForm = useCallback(
    (nextState?: PlantFormState) => {
      setValues(nextState ?? initialState);
      setErrors({});
      setIsDirty(false);
    },
    [initialState]
  );

  const validate = useCallback((): boolean => {
    const nextErrors = validatePlantForm(values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values]);

  return {
    values,
    errors,
    isDirty,
    setField,
    resetForm,
    validate,
    setErrors
  };
}
