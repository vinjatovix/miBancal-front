import { t } from '../../i18n/core/t';
import { tValue } from '../../i18n/core/tValue';
import { monthNames } from '../../i18n/core/monthNames';
import { readPlantSafety } from '../../pages/plants/utils/plantSafety';
import { capitalizeFirstLetter } from '../../shared/utils/capitalizeFirstLetter';
import { getDomainFromUrl } from '../../shared/utils/getDomainFromUrl';
import type { Range } from '../../types/Range';
import type { Plant } from '../../types/Plants/Plant';
import type { SupportResource } from '../../types/SupportResource';
import type {
  PlantPdfContentBlock,
  PlantPdfContentRow,
  PlantPdfExportOptions,
  PlantPdfHeader,
  PlantPdfPayload,
  PlantPdfResourcesSection,
  ResourceQrEntry
} from '../../types/Export/PlantPdfExport';
import { formatPlantPdfFilename } from './plantPdfFilename';

type Rows = readonly PlantPdfContentRow[];

const NAVIGABLE_URL_PATTERN = /^https?:\/\//i;

function formatRange(range: Range | undefined): string | null {
  if (!range || range.min == null || range.max == null) {
    return null;
  }
  if (range.min === range.max) {
    return t('plant.export.value_cm', { value: range.min });
  }
  return t('plant.export.value_cm_range', { min: range.min, max: range.max });
}

function formatMonths(months: readonly number[]): string {
  const names = monthNames();
  return months
    .map((month) => names[month - 1]?.long)
    .filter((name): name is string => Boolean(name))
    .join(', ');
}

function row(label: string, value: string): PlantPdfContentRow {
  return { label, value };
}

function collectRows(
  candidates: ReadonlyArray<readonly [string, string | null | undefined]>
): Rows {
  return candidates
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, value]) => row(label, value));
}

function buildQuickFactsRows(plant: Plant): Rows {
  const traits = plant.traits;
  const light = plant.knowledge?.light;
  const lifecycle = traits?.lifecycle
    ? tValue('plant.filters.lifeCycleValues', traits.lifecycle)
    : null;
  const lightType = light?.type
    ? tValue('plant.filters.lightTypeValues', light.type)
    : null;
  const lightHours =
    light?.hoursMin == null
      ? null
      : t('plant.export.value_light_hours', { hours: light.hoursMin });
  return collectRows([
    [t('plant.export.row_lifecycle'), lifecycle],
    [t('plant.export.row_height'), formatRange(traits?.size?.height)],
    [t('plant.export.row_spread'), formatRange(traits?.size?.spread)],
    [t('plant.export.row_spacing'), formatRange(traits?.spacingCm)],
    [t('plant.export.row_light'), lightType],
    [t('plant.export.row_light_hours'), lightHours]
  ]);
}

function buildCalendarRows(plant: Plant): Rows {
  const phenology = plant.phenology;
  const entries: Array<[string, readonly number[]]> = [
    [t('plant.export.row_sowing'), phenology?.sowing?.months ?? []],
    [t('plant.export.row_flowering'), phenology?.flowering?.months ?? []],
    [t('plant.export.row_harvest'), phenology?.harvest?.months ?? []]
  ];
  return entries
    .filter(([, months]) => months.length > 0)
    .map(([label, months]) => row(label, formatMonths(months)));
}

function buildSafetyRows(plant: Plant): Rows {
  const safety = readPlantSafety(plant);
  if (!safety.hasData) {
    return [];
  }
  const rows: PlantPdfContentRow[] = [
    row(
      t('plant.export.row_edible'),
      tValue('plant.safety.flagValues', safety.edible)
    ),
    row(
      t('plant.export.row_toxic'),
      tValue('plant.safety.flagValues', safety.toxic)
    )
  ];
  if (safety.toxicityNotes) {
    rows.push(row(t('plant.export.row_toxicity_notes'), safety.toxicityNotes));
  }
  return rows;
}

function buildCultivationRows(plant: Plant): Rows {
  const soil = plant.knowledge?.soil;
  const rootSystem = plant.knowledge?.rootSystem;
  const soilPh =
    soil?.ph?.min == null || soil.ph.max == null
      ? null
      : t('plant.export.value_ph_range', {
          min: soil.ph.min,
          max: soil.ph.max
        });
  const rootType = rootSystem?.type
    ? tValue('plant.filters.rootSystemValues', rootSystem.type)
    : null;
  return collectRows([
    [t('plant.export.row_soil_ph'), soilPh],
    [t('plant.export.row_soil_depth'), formatRange(soil?.availableDepthCm)],
    [t('plant.export.row_root_system'), rootType],
    [t('plant.export.row_root_depth'), formatRange(rootSystem?.depthCm)]
  ]);
}

function buildEcologyRows(plant: Plant): Rows {
  const benefits = plant.knowledge?.ecology?.strategicBenefits ?? [];
  return benefits.map((benefit) => row('', benefit));
}

function buildNotesRows(plant: Plant): Rows {
  return (plant.knowledge?.notes ?? []).map((note) => row('', note));
}

interface SectionSpec {
  readonly section: PlantPdfContentBlock['section'];
  readonly selected: boolean;
  readonly titleKey: Parameters<typeof t>[0];
  build(plant: Plant): Rows;
}

function buildSections(
  plant: Plant,
  options: PlantPdfExportOptions
): readonly PlantPdfContentBlock[] {
  const specs: readonly SectionSpec[] = [
    {
      section: 'quickFacts',
      selected: options.includeQuickFacts,
      titleKey: 'plant.export.pdf_section_quick_facts',
      build: buildQuickFactsRows
    },
    {
      section: 'calendar',
      selected: options.includeCalendar,
      titleKey: 'plant.export.pdf_section_calendar',
      build: buildCalendarRows
    },
    {
      section: 'safety',
      selected: options.includeSafety,
      titleKey: 'plant.export.pdf_section_safety',
      build: buildSafetyRows
    },
    {
      section: 'cultivation',
      selected: options.includeCultivation,
      titleKey: 'plant.export.pdf_section_cultivation',
      build: buildCultivationRows
    },
    {
      section: 'ecology',
      selected: options.includeEcology,
      titleKey: 'plant.export.pdf_section_ecology',
      build: buildEcologyRows
    },
    {
      section: 'notes',
      selected: options.includeNotes,
      titleKey: 'plant.export.pdf_section_notes',
      build: buildNotesRows
    }
  ];

  const blocks: PlantPdfContentBlock[] = [];
  for (const spec of specs) {
    if (!spec.selected) continue;
    const rows = spec.build(plant);
    if (rows.length === 0) continue;
    blocks.push({ section: spec.section, title: t(spec.titleKey), rows });
  }
  return blocks;
}

function toResourceEntry(resource: SupportResource): ResourceQrEntry {
  const domain = getDomainFromUrl(resource.url);
  return {
    url: resource.url,
    title: resource.title ?? domain,
    type: resource.type,
    domain
  };
}

function buildResourcesSection(
  plant: Plant,
  options: PlantPdfExportOptions
): PlantPdfResourcesSection | null {
  if (!options.includeResources) {
    return null;
  }
  const mainImageUrl = plant.image?.url;
  const entries = (plant.knowledge?.resources ?? [])
    .filter((resource) => NAVIGABLE_URL_PATTERN.test(resource.url))
    .filter((resource) => resource.url !== mainImageUrl)
    .map(toResourceEntry);
  return { entries };
}

function resolveFamilyName(family: Plant['identity']['family']): string | null {
  if (!family) return null;
  if (typeof family === 'string') return family;
  return family.name;
}

function buildHeader(plant: Plant, generationDate: Date): PlantPdfHeader {
  return {
    commonName: capitalizeFirstLetter(plant.identity.name.primary),
    scientificName: plant.identity.scientificName
      ? capitalizeFirstLetter(plant.identity.scientificName)
      : null,
    familyName: resolveFamilyName(plant.identity.family),
    generationDateLabel: t('plant.export.pdf_generation_date', {
      date: generationDate.toLocaleDateString('es-ES')
    })
  };
}

export function buildPlantPdfPayload(
  plant: Plant,
  options: PlantPdfExportOptions,
  generationDate: Date
): PlantPdfPayload {
  return {
    filename: formatPlantPdfFilename(plant, generationDate),
    generationDate,
    header: buildHeader(plant, generationDate),
    imageDataUrl: options.includeImage ? options.imageDataUrl : null,
    sections: buildSections(plant, options),
    resources: buildResourcesSection(plant, options)
  };
}
