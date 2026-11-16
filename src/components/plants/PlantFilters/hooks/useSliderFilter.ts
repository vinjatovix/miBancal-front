import { useEffect, useState } from 'react';

export function useSliderFilter(initialValue: string | null) {
  const [value, setValue] = useState<number | null>(
    initialValue ? Number(initialValue) : null
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(initialValue ? Number(initialValue) : null);
  }, [initialValue]);

  function clear() {
    setValue(null);
  }

  return {
    value,
    setValue,
    clear
  };
}
