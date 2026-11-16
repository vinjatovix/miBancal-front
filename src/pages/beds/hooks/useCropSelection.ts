import { useCallback, useState } from 'react';

export function useCropSelection() {
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedCropIds, setSelectedCropIdsState] = useState<
    ReadonlySet<string>
  >(new Set());

  const selectCrop = useCallback((id: string | null) => {
    setSelectedCropId(id);
    setSelectedCropIdsState(id ? new Set([id]) : new Set());
  }, []);

  const setSelectedCropIds = useCallback((ids: ReadonlySet<string>) => {
    setSelectedCropIdsState(ids);
    if (ids.size === 1) {
      setSelectedCropId(Array.from(ids)[0]);
    } else if (ids.size === 0) {
      setSelectedCropId(null);
    }
  }, []);

  const toggleCropSelection = useCallback((id: string) => {
    setSelectedCropIdsState((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setSelectedCropId(next.size === 1 ? Array.from(next)[0] : null);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCropIdsState(new Set());
    setSelectedCropId(null);
  }, []);

  const pruneSelection = useCallback((removedIds: ReadonlySet<string>) => {
    setSelectedCropIdsState(
      (current) => new Set([...current].filter((id) => !removedIds.has(id)))
    );
    setSelectedCropId((current) =>
      current && removedIds.has(current) ? null : current
    );
  }, []);

  return {
    selectedCropId,
    selectedCropIds,
    selectCrop,
    setSelectedCropIds,
    toggleCropSelection,
    clearSelection,
    pruneSelection
  };
}
