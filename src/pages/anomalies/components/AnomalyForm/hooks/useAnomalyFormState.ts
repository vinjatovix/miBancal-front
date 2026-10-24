import { useCallback, useState } from 'react';

import type { AnomalyFormMode, AnomalyFormState } from '../types';
import { validateAnomalyForm } from '../utils/validateAnomalyForm';

export function useAnomalyFormState(
  initialState: AnomalyFormState,
  mode: AnomalyFormMode,
  startsDirty = false
) {
  const [values, setValues] = useState<AnomalyFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState<boolean>(startsDirty);

  const setField = useCallback(
    <K extends keyof AnomalyFormState>(
      field: K,
      value: AnomalyFormState[K]
    ) => {
      setIsDirty(true);
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const validate = useCallback((): boolean => {
    const nextErrors = validateAnomalyForm(values, mode);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values, mode]);

  return { values, errors, isDirty, setField, validate, setErrors };
}
