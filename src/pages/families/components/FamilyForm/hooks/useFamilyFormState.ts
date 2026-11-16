import { useCallback, useState } from 'react';

import type { FamilyFormState } from '../types';
import { slugify } from '../utils/slugify';
import { validateFamilyForm } from '../utils/validateFamilyForm';

export function useFamilyFormState(initialState: FamilyFormState) {
  const [values, setValues] = useState<FamilyFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(
    Boolean(initialState.slug)
  );

  const setField = useCallback(
    <K extends keyof FamilyFormState>(field: K, value: FamilyFormState[K]) => {
      setIsDirty(true);
      if (field === 'slug') {
        setIsSlugManuallyEdited(true);
      }
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        if (field === 'scientificName' && !isSlugManuallyEdited) {
          next.slug = slugify(String(value));
        }
        return next;
      });
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [isSlugManuallyEdited]
  );

  const resetForm = useCallback(
    (nextState?: FamilyFormState) => {
      const state = nextState ?? initialState;
      setValues(state);
      setErrors({});
      setIsDirty(false);
      setIsSlugManuallyEdited(Boolean(state.slug));
    },
    [initialState]
  );

  const validate = useCallback((): boolean => {
    const nextErrors = validateFamilyForm(values, initialState.slug);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values, initialState.slug]);

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
