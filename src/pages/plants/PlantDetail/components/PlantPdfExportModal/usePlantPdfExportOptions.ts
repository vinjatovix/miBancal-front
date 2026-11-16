import { useCallback, useMemo, useState } from 'react';

import { hasPlantPdfContentSelected } from '../../../../../services/pdf/plantPdfContent';
import type {
  PlantPdfExportOptions,
  PlantPdfSection
} from '../../../../../types/Export/PlantPdfExport';

const SECTION_FLAGS: Record<
  PlantPdfSection,
  keyof Omit<PlantPdfExportOptions, 'imageDataUrl'>
> = {
  image: 'includeImage',
  quickFacts: 'includeQuickFacts',
  calendar: 'includeCalendar',
  safety: 'includeSafety',
  cultivation: 'includeCultivation',
  ecology: 'includeEcology',
  notes: 'includeNotes',
  resources: 'includeResources'
};

function buildDefaults(): PlantPdfExportOptions {
  return {
    includeImage: true,
    includeQuickFacts: true,
    includeCalendar: true,
    includeSafety: true,
    includeCultivation: true,
    includeEcology: true,
    includeNotes: true,
    includeResources: true,
    imageDataUrl: null
  };
}

export interface UsePlantPdfExportOptionsResult {
  readonly options: PlantPdfExportOptions;
  readonly canDownload: boolean;
  toggleSection(section: PlantPdfSection): void;
}

export function usePlantPdfExportOptions(
  isOpen: boolean
): UsePlantPdfExportOptionsResult {
  const [options, setOptions] = useState<PlantPdfExportOptions>(buildDefaults);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setOptions(buildDefaults());
    }
  }

  const toggleSection = useCallback((section: PlantPdfSection) => {
    const flag = SECTION_FLAGS[section];
    setOptions((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const canDownload = useMemo(
    () => hasPlantPdfContentSelected(options),
    [options]
  );

  return { options, canDownload, toggleSection };
}
