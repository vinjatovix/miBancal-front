import type { PlantPdfExportOptions } from '../../types/Export/PlantPdfExport';

export function hasPlantPdfContentSelected(
  options: PlantPdfExportOptions
): boolean {
  return (
    options.includeImage ||
    options.includeQuickFacts ||
    options.includeCalendar ||
    options.includeSafety ||
    options.includeCultivation ||
    options.includeEcology ||
    options.includeNotes ||
    options.includeResources
  );
}
