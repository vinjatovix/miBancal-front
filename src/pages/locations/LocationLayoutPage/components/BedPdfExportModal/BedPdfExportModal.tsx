import { useCallback, useEffect, useRef, useState, type JSX } from 'react';

import { t } from '../../../../../i18n/core/t';
import type { I18nKey } from '../../../../../i18n/core/types';
import Button from '../../../../../shared/components/Button/Button';
import Modal from '../../../../../shared/components/Modal/Modal';
import {
  reportUnexpectedError,
  toUnexpectedErrorReport
} from '../../../../../shared/observability/reportUnexpectedError';
import { useToastActions } from '../../../../../shared/toast/useToast';
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

const SPINNER_DELAY_MS = 400;

export interface BedPdfExportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly layout: LocationLayoutResponse;
  readonly placedBeds: readonly ResolvedBed[];
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly effectiveNorthAngle: number | null;
  readonly activeGridLayers: ActiveGridLayers;
}

interface ExportCheckboxProps {
  readonly labelKey: I18nKey;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onChange: () => void;
}

function ExportCheckbox({
  labelKey,
  checked,
  disabled,
  onChange
}: ExportCheckboxProps): JSX.Element {
  return (
    <label className="bed-pdf-export-modal__option">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span>{t(labelKey)}</span>
    </label>
  );
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
  const { showSuccessToast, showErrorToast } = useToastActions();
  const [isBusy, setIsBusy] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const spinnerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (spinnerTimer.current) {
        clearTimeout(spinnerTimer.current);
        spinnerTimer.current = null;
      }
    };
  }, []);

  const handleDownload = useCallback(async () => {
    setIsBusy(true);
    spinnerTimer.current = setTimeout(() => {
      if (isMountedRef.current) {
        setShowSpinner(true);
      }
    }, SPINNER_DELAY_MS);
    try {
      await exportLocationLayoutToPdf({
        layout,
        placedBeds,
        cropsByBed,
        options,
        effectiveNorthAngle
      });
      if (isMountedRef.current) {
        showSuccessToast(t('bed.export.toast_success'));
        onClose();
      }
    } catch (error) {
      reportUnexpectedError(
        toUnexpectedErrorReport(error, {
          kind: 'unknown',
          section: 'bed-pdf-export'
        }),
        error
      );
      if (isMountedRef.current) {
        showErrorToast(undefined, t('bed.export.toast_error'));
      }
    } finally {
      if (spinnerTimer.current) {
        clearTimeout(spinnerTimer.current);
        spinnerTimer.current = null;
      }
      if (isMountedRef.current) {
        setShowSpinner(false);
        setIsBusy(false);
      }
    }
  }, [
    cropsByBed,
    effectiveNorthAngle,
    layout,
    onClose,
    options,
    placedBeds,
    showErrorToast,
    showSuccessToast
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('bed.export.modal_title')}
      subtitle={t('bed.export.modal_subtitle')}
      icon="save"
      preventClose={isBusy}
      footer={
        <div className="bed-pdf-export-modal__actions">
          <Button variant="secondary" onClick={onClose} disabled={isBusy}>
            {t('bed.export.action_cancel')}
          </Button>
          <Button
            variant="primary"
            icon="save"
            onClick={() => void handleDownload()}
            disabled={!canDownload || isBusy}
          >
            {showSpinner
              ? t('bed.export.generating')
              : t('bed.export.action_download')}
          </Button>
        </div>
      }
    >
      <section className="bed-pdf-export-modal__section">
        <h3 className="bed-pdf-export-modal__section-title">
          {t('bed.export.section_content')}
        </h3>
        {CONTENT_FLAGS.map((entry) => (
          <ExportCheckbox
            key={entry.flag}
            labelKey={entry.labelKey}
            checked={options[entry.flag]}
            disabled={isBusy}
            onChange={() => toggleFlag(entry.flag)}
          />
        ))}
      </section>

      <section className="bed-pdf-export-modal__section">
        <h3 className="bed-pdf-export-modal__section-title">
          {t('bed.export.section_layers')}
        </h3>
        {LAYER_FLAGS.map((entry) => (
          <ExportCheckbox
            key={entry.flag}
            labelKey={entry.labelKey}
            checked={options[entry.flag]}
            disabled={isBusy}
            onChange={() => toggleFlag(entry.flag)}
          />
        ))}
      </section>

      <section className="bed-pdf-export-modal__section">
        <h3 className="bed-pdf-export-modal__section-title">
          {t('bed.export.section_beds')}
        </h3>
        <BedSelectorList
          beds={placedBeds}
          selectedBedIds={options.selectedBedIds}
          onToggleBed={toggleBed}
          onSelectAll={selectAllBeds}
          onDeselectAll={deselectAllBeds}
          disabled={isBusy}
        />
      </section>
    </Modal>
  );
}
