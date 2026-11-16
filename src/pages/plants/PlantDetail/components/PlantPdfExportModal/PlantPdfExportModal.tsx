import { useCallback, useState, type JSX } from 'react';

import { t } from '../../../../../i18n/core/t';
import type { I18nKey } from '../../../../../i18n/core/types';
import Button from '../../../../../shared/components/Button/Button';
import {
  PdfExportCheckbox,
  PdfExportModalShell,
  PdfExportSection,
  usePdfExportRunner,
  type PdfExportModalLabels
} from '../../../../../shared/components/PdfExport';
import { exportPlantToPdf } from '../../../../../services/pdf/plantPdfExport.service';
import { loadRemoteImage } from '../../../../../services/pdf/utils/loadRemoteImage';
import type { Plant } from '../../../../../types/Plants/Plant';
import type {
  PlantPdfExportOptions,
  PlantPdfSection
} from '../../../../../types/Export/PlantPdfExport';
import { usePlantPdfExportOptions } from './usePlantPdfExportOptions';

import './plantPdfExportModal.css';

const LABELS: PdfExportModalLabels = {
  title: 'plant.export.modal_title',
  subtitle: 'plant.export.modal_subtitle',
  cancel: 'plant.export.action_cancel',
  download: 'plant.export.action_download',
  generating: 'plant.export.generating'
};

export interface PlantPdfExportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly plant: Plant;
}

type IncludeFlag = keyof Omit<PlantPdfExportOptions, 'imageDataUrl'>;

const SECTIONS: ReadonlyArray<{
  section: PlantPdfSection;
  flag: IncludeFlag;
  labelKey: I18nKey;
}> = [
  {
    section: 'image',
    flag: 'includeImage',
    labelKey: 'plant.export.option_image'
  },
  {
    section: 'quickFacts',
    flag: 'includeQuickFacts',
    labelKey: 'plant.export.option_quick_facts'
  },
  {
    section: 'calendar',
    flag: 'includeCalendar',
    labelKey: 'plant.export.option_calendar'
  },
  {
    section: 'safety',
    flag: 'includeSafety',
    labelKey: 'plant.export.option_safety'
  },
  {
    section: 'cultivation',
    flag: 'includeCultivation',
    labelKey: 'plant.export.option_cultivation'
  },
  {
    section: 'ecology',
    flag: 'includeEcology',
    labelKey: 'plant.export.option_ecology'
  },
  {
    section: 'notes',
    flag: 'includeNotes',
    labelKey: 'plant.export.option_notes'
  },
  {
    section: 'resources',
    flag: 'includeResources',
    labelKey: 'plant.export.option_resources'
  }
];

export default function PlantPdfExportModal({
  isOpen,
  onClose,
  plant
}: PlantPdfExportModalProps): JSX.Element {
  const { options, canDownload, toggleSection } =
    usePlantPdfExportOptions(isOpen);
  const { isBusy, showSpinner, start, stop, run } = usePdfExportRunner();
  const [imageFailed, setImageFailed] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setImageFailed(false);
    }
  }

  const runExport = useCallback(
    (overrides: Partial<PlantPdfExportOptions>) =>
      run(
        () =>
          exportPlantToPdf({ plant, options: { ...options, ...overrides } }),
        {
          successMessage: t('plant.export.toast_success'),
          errorMessage: t('plant.export.toast_error'),
          errorSection: 'plant-pdf-export',
          onSuccess: onClose
        }
      ),
    [onClose, options, plant, run]
  );

  const handleDownload = useCallback(async () => {
    setImageFailed(false);
    start();
    const imageUrl = plant.image?.url;
    if (options.includeImage && imageUrl) {
      try {
        const { dataUrl } = await loadRemoteImage(imageUrl);
        await runExport({ imageDataUrl: dataUrl });
      } catch {
        setImageFailed(true);
        stop();
      }
      return;
    }
    await runExport({ imageDataUrl: null });
  }, [options.includeImage, plant.image?.url, runExport, start, stop]);

  const handleExportWithoutImage = useCallback(async () => {
    setImageFailed(false);
    start();
    await runExport({ imageDataUrl: null });
  }, [runExport, start]);

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
      <PdfExportSection titleKey="plant.export.section_content">
        <div
          role="group"
          aria-label={t('plant.export.group_label')}
          className="pdf-export-modal__group"
        >
          {SECTIONS.map(({ section, flag, labelKey }) => (
            <PdfExportCheckbox
              key={section}
              labelKey={labelKey}
              checked={options[flag]}
              disabled={isBusy}
              onChange={() => toggleSection(section)}
            />
          ))}
        </div>
      </PdfExportSection>

      {imageFailed && (
        <div className="plant-pdf-export-modal__image-error" role="alert">
          <p>{t('plant.export.image_failed_notice')}</p>
          <Button
            variant="secondary"
            onClick={() => void handleExportWithoutImage()}
            disabled={isBusy}
          >
            {t('plant.export.action_export_without_image')}
          </Button>
        </div>
      )}
    </PdfExportModalShell>
  );
}
