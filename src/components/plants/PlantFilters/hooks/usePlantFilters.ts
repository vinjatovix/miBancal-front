import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSliderFilter } from './useSliderFilter';
import { useDebouncedCallback } from './useDebouncedCallback';
import { PLANT_LIST_URL_PARAMS } from '../../../../shared/constants/plantListUrlParams';
import { parseBooleanFilter } from '../../../../services/plantListQuery';

const FILTER_COALESCE_DELAY_MS = 300;

type TextFilterKey = 'identity';

function useTextFilters(
  setParam: (key: string, value?: string) => void,
  getParam: (key: string) => string
) {
  const urlIdentity = getParam(PLANT_LIST_URL_PARAMS.identity);
  const [textState, setTextState] = useState<Record<TextFilterKey, string>>({
    identity: urlIdentity
  });
  const [lastUrlIdentity, setLastUrlIdentity] = useState(urlIdentity);

  if (urlIdentity !== lastUrlIdentity) {
    setLastUrlIdentity(urlIdentity);
    setTextState((prev) => ({ ...prev, identity: urlIdentity }));
  }

  const handleTextChange = useCallback(
    (key: TextFilterKey, value: string) => {
      setTextState((prev) => ({ ...prev, [key]: value }));
      setParam(key, value);
    },
    [setParam]
  );

  const clearText = useCallback(() => {
    setTextState({ identity: '' });
  }, []);

  return { textState, handleTextChange, clearText };
}

function useSliderFilters(getParam: (key: string) => string) {
  const soilPh = useSliderFilter(getParam(PLANT_LIST_URL_PARAMS.soilPh));
  const lightHours = useSliderFilter(
    getParam(PLANT_LIST_URL_PARAMS.lightHoursMin)
  );
  const spacing = useSliderFilter(getParam(PLANT_LIST_URL_PARAMS.spacingCm));
  const soilDepth = useSliderFilter(
    getParam(PLANT_LIST_URL_PARAMS.soilAvailableDepthCm)
  );

  return { soilPh, lightHours, spacing, soilDepth };
}

function useSelectFilters(getParam: (key: string) => string) {
  const lifeCycle = getParam(PLANT_LIST_URL_PARAMS.lifeCycle);
  const sowingMethod = getParam(PLANT_LIST_URL_PARAMS.sowingMethod);
  const lightType = getParam(PLANT_LIST_URL_PARAMS.lightType);
  const rootSystem = getParam(PLANT_LIST_URL_PARAMS.rootSystem);
  const sowingMonth = getParam(PLANT_LIST_URL_PARAMS.sowingMonth);
  const hemisphere =
    (getParam(PLANT_LIST_URL_PARAMS.hemisphere) as 'north' | 'south') ||
    'north';

  return {
    lifeCycle,
    sowingMethod,
    lightType,
    rootSystem,
    sowingMonth,
    hemisphere
  };
}

export function usePlantFilters() {
  const [params, setParams] = useSearchParams();
  const pendingRef = useRef<Record<string, string | undefined>>({});
  const setParamsRef = useRef(setParams);

  useEffect(() => {
    setParamsRef.current = setParams;
  }, [setParams]);

  const flushPending = useCallback(() => {
    const pending = pendingRef.current;
    const keys = Object.keys(pending);
    if (keys.length === 0) return;
    pendingRef.current = {};

    setParamsRef.current((prev) => {
      const next = new URLSearchParams(prev);

      keys.forEach((key) => {
        const value = pending[key];
        if (value && value.length > 0) next.set(key, value);
        else next.delete(key);
      });

      if (!keys.includes(PLANT_LIST_URL_PARAMS.page)) {
        next.delete(PLANT_LIST_URL_PARAMS.page);
      }

      return next;
    });
  }, []);

  const debouncedFlush = useDebouncedCallback<void>(
    flushPending,
    FILTER_COALESCE_DELAY_MS
  );

  const setParam = useCallback(
    (key: string, value?: string) => {
      pendingRef.current = { ...pendingRef.current, [key]: value };
      debouncedFlush.call();
    },
    [debouncedFlush]
  );

  const setParamNow = useCallback(
    (key: string, value?: string) => {
      pendingRef.current = { ...pendingRef.current, [key]: value };
      debouncedFlush.cancel();
      flushPending();
    },
    [debouncedFlush, flushPending]
  );

  const getParam = useCallback(
    (key: string) => params.get(key) ?? '',
    [params]
  );

  const family = getParam(PLANT_LIST_URL_PARAMS.family);
  const edible = parseBooleanFilter(
    params.getAll(PLANT_LIST_URL_PARAMS.edible)
  );
  const toxic = parseBooleanFilter(params.getAll(PLANT_LIST_URL_PARAMS.toxic));

  const setFamily = useCallback(
    (value: string) => {
      setParamNow(PLANT_LIST_URL_PARAMS.family, value);
    },
    [setParamNow]
  );

  const { textState, handleTextChange, clearText } = useTextFilters(
    setParam,
    getParam
  );
  const { soilPh, lightHours, spacing, soilDepth } = useSliderFilters(getParam);
  const {
    lifeCycle,
    sowingMethod,
    lightType,
    rootSystem,
    sowingMonth,
    hemisphere
  } = useSelectFilters(getParam);

  const clearFilters = useCallback(() => {
    pendingRef.current = {};
    debouncedFlush.cancel();
    setParams({});
    clearText();
    soilPh.clear();
    lightHours.clear();
    spacing.clear();
    soilDepth.clear();
  }, [
    setParams,
    clearText,
    soilPh,
    lightHours,
    spacing,
    soilDepth,
    debouncedFlush
  ]);

  const setHemisphere = useCallback(
    (value: 'north' | 'south') => {
      setParamNow(PLANT_LIST_URL_PARAMS.hemisphere, value);
    },
    [setParamNow]
  );

  return {
    setParam,
    setParamNow,
    getParam,

    family,
    setFamily,

    textState,
    handleTextChange,

    lifeCycle,
    sowingMethod,
    lightType,
    rootSystem,
    edible,
    toxic,

    hemisphere,
    sowingMonth,

    soilPh,
    lightHours,
    spacing,
    soilDepth,

    clearFilters,
    setHemisphere
  };
}
