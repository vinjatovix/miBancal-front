import { useCallback, type JSX } from 'react';

import { t } from '../../../../../i18n/core/t';
import type { I18nKey } from '../../../../../i18n/core/types';
import {
  PdfExportCheckbox,
  PdfExportModalShell,
  PdfExportSection,
  usePdfExportRunner,
  type PdfExportModalLabels
} from '../../../../../shared/components/PdfExport';
import { exportLocationLayoutToPdf } from '../../../../../services/pdf/bedPdfExport.service';
import type { ResolvedBed } from '../../../../../components/beds/layout/utils/layoutTypes';
import type { ActiveGridLayers } from '../../../../../components/beds/visualizer/utils/bedGridConfig';
import type { LocationLayoutResponse } from '../../../../../types/Location/LocationLayout';
import type { CropPlacementItem } from '../../../../../types/PlantInstance/plantPlacementTypes';
import BedSelectorList from './BedSelectorList';
import {
  useBedPdfExportOptions,
  type BedPdfExportFlag
} from './useBedPdfExportOptions';

import './BedPdfExportModal.css';

const LABELS: PdfExportModalLabels = {
  title: 'bed.export.modal_title',
  subtitle: 'bed.export.modal_subtitle',
  cancel: 'bed.export.action_cancel',
  download: 'bed.export.action_download',
  generating: 'bed.export.generating'
};

export interface BedPdfExportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly layout: LocationLayoutResponse;
  readonly placedBeds: readonly ResolvedBed[];
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly effectiveNorthAngle: number | null;
  readonly activeGridLayers: ActiveGridLayers;
}

const CONTENT_FLAGS: ReadonlyArray<{
  flag: BedPdfExportFlag;
  labelKey: I18nKey;
}> = [
  {
    flag: 'includeLocationLayout',
    labelKey: 'bed.export.option_location_layout'
  },
  { flag: 'includeBedSheets', labelKey: 'bed.export.option_bed_sheets' },
  { flag: 'includePlantList', labelKey: 'bed.export.option_plant_list' }
];

const LAYER_FLAGS: ReadonlyArray<{
  flag: BedPdfExportFlag;
  labelKey: I18nKey;
}> = [
  { flag: 'showDimensions', labelKey: 'bed.export.layer_dimensions' },
  { flag: 'showGrid', labelKey: 'bed.export.layer_grid' },
  { flag: 'showCompass', labelKey: 'bed.export.layer_compass' }
];

export default function BedPdfExportModal({
  isOpen,
  onClose,
  layout,
  placedBeds,
  cropsByBed,
  effectiveNorthAngle,
  activeGridLayers
}: BedPdfExportModalProps): JSX.Element {
  const {
    options,
    canDownload,
    toggleFlag,
    toggleBed,
    selectAllBeds,
    deselectAllBeds
  } = useBedPdfExportOptions(placedBeds, isOpen, activeGridLayers);
  const { isBusy, showSpinner, run } = usePdfExportRunner();

  const handleDownload = useCallback(
    () =>
      run(
        () =>
          exportLocationLayoutToPdf({
            layout,
            placedBeds,
            cropsByBed,
            options,
            effectiveNorthAngle
          }),
        {
          successMessage: t('bed.export.toast_success'),
          errorMessage: t('bed.export.toast_error'),
          errorSection: 'bed-pdf-export',
          onSuccess: onClose
        }
      ),
    [cropsByBed, effectiveNorthAngle, layout, onClose, options, placedBeds, run]
  );

  return (
    <PdfExportModalShell
      isOpen={isOpen}
      onClose={onClose}
      labels={LABELS}
      canDownload={canDownload}
      isBusy={isBusy}
      showSpinner={showSpinner}
      onDownload={() => void handleDownload()}
    >
      <PdfExportSection titleKey="bed.export.section_content" divided>
        {CONTENT_FLAGS.map((entry) => (
          <PdfExportCheckbox
            key={entry.flag}
            labelKey={entry.labelKey}
            checked={options[entry.flag]}
            disabled={isBusy}
            onChange={() => toggleFlag(entry.flag)}
          />
        ))}
      </PdfExportSection>

      <PdfExportSection titleKey="bed.export.section_layers" divided>
        {LAYER_FLAGS.map((entry) => (
          <PdfExportCheckbox
            key={entry.flag}
            labelKey={entry.labelKey}
            checked={options[entry.flag]}
            disabled={isBusy}
            onChange={() => toggleFlag(entry.flag)}
          />
        ))}
      </PdfExportSection>

      <PdfExportSection titleKey="bed.export.section_beds" divided>
        <BedSelectorList
          beds={placedBeds}
          selectedBedIds={options.selectedBedIds}
          onToggleBed={toggleBed}
          onSelectAll={selectAllBeds}
          onDeselectAll={deselectAllBeds}
          disabled={isBusy}
        />
      </PdfExportSection>
    </PdfExportModalShell>
  );
}
