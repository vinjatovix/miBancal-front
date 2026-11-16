import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BedPdfExportModal from '../../../../../../src/pages/locations/LocationLayoutPage/components/BedPdfExportModal/BedPdfExportModal';
import type { ResolvedBed } from '../../../../../../src/components/beds/layout/utils/layoutTypes';
import type { LocationLayoutResponse } from '../../../../../../src/types/Location/LocationLayout';
import type { CropPlacementItem } from '../../../../../../src/types/PlantInstance/plantPlacementTypes';
import { DEFAULT_ACTIVE_GRID_LAYERS } from '../../../../../../src/components/beds/visualizer/utils/bedGridConfig';
import { toastStore } from '../../../../../../src/shared/toast/toastStore';
import '../../../../../../src/i18n/messages/beds';

const exportMock = vi.fn();

vi.mock('../../../../../../src/services/pdf/bedPdfExport.service', () => ({
  exportLocationLayoutToPdf: (...args: unknown[]) => exportMock(...args)
}));

function buildLayout(): LocationLayoutResponse {
  return {
    location: {
      id: 'loc-1',
      name: 'Huerto Norte',
      northAngle: 0,
      width: 1000,
      height: 800
    },
    placedBeds: [],
    unplacedBeds: [],
    companionGraph: []
  };
}

function buildBeds(): ResolvedBed[] {
  return [
    {
      id: 'bed-1',
      name: 'Bancal Sur',
      width: 400,
      height: 200,
      position: { x: 0, y: 0 },
      rotation: 0
    }
  ];
}

function buildModal(
  isOpen: boolean,
  onClose: () => void = vi.fn(),
  placedBeds: ResolvedBed[] = buildBeds()
) {
  return (
    <BedPdfExportModal
      isOpen={isOpen}
      onClose={onClose}
      layout={buildLayout()}
      placedBeds={placedBeds}
      cropsByBed={new Map<string, readonly CropPlacementItem[]>()}
      effectiveNorthAngle={0}
      activeGridLayers={DEFAULT_ACTIVE_GRID_LAYERS}
    />
  );
}

function renderModal(
  onClose: () => void = vi.fn(),
  placedBeds: ResolvedBed[] = buildBeds()
) {
  return render(buildModal(true, onClose, placedBeds));
}

describe('BedPdfExportModal', () => {
  beforeEach(() => {
    toastStore.clearToasts();
    exportMock.mockReset();
    exportMock.mockResolvedValue({
      success: true,
      filename: 'huerto-norte.pdf',
      pageCount: 2
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an accessible dialog with a labelled title', () => {
    renderModal();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(
      screen.getByRole('heading', { name: 'Exportar ficha técnica a PDF' })
    ).toBeInTheDocument();
  });

  it('preselects every content option and bed by default', () => {
    renderModal();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    checkboxes.forEach((checkbox) => expect(checkbox).toBeChecked());
    expect(screen.getByRole('button', { name: /Descargar PDF/ })).toBeEnabled();
  });

  it('disables download when no content remains selected', async () => {
    renderModal();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('checkbox', { name: 'Plano general de la ubicación' })
    );
    await user.click(
      screen.getByRole('checkbox', { name: 'Planos individuales de bancales' })
    );
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Lista y resumen de plantas por bancal'
      })
    );

    expect(
      screen.getByRole('button', { name: /Descargar PDF/ })
    ).toBeDisabled();
  });

  it('disables download when the overview is off and no bed is selected', async () => {
    renderModal();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('checkbox', { name: 'Plano general de la ubicación' })
    );
    await user.click(screen.getByRole('button', { name: 'Desmarcar todos' }));

    expect(
      screen.getByRole('button', { name: /Descargar PDF/ })
    ).toBeDisabled();
  });

  it('disables download when there are no placed beds in the location', () => {
    renderModal(vi.fn(), []);

    expect(
      screen.getByText('No hay bancales emplazados en esta ubicación')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Descargar PDF/ })
    ).toBeDisabled();
  });

  it('restores the default selection when the modal is reopened', async () => {
    const { rerender } = renderModal();
    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: 'Bancal Sur' }));

    rerender(buildModal(false));
    rerender(buildModal(true));

    expect(screen.getByRole('checkbox', { name: 'Bancal Sur' })).toBeChecked();
  });

  it('exports the configured selection and closes on a successful download', async () => {
    const onClose = vi.fn();
    renderModal(onClose);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('checkbox', { name: 'Malla agrícola / cuadrícula' })
    );

    await user.click(screen.getByRole('button', { name: /Descargar PDF/ }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(exportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          showGrid: false,
          showDimensions: true,
          selectedBedIds: ['bed-1']
        })
      })
    );
  });

  it('keeps the modal open and shows the localized error instead of the raw failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    exportMock.mockRejectedValueOnce(new Error('boom'));
    const onClose = vi.fn();
    renderModal(onClose);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Descargar PDF/ }));

    await waitFor(() =>
      expect(toastStore.getSnapshot().map((toast) => toast.message)).toEqual([
        'No se pudo generar el documento PDF. Inténtalo de nuevo.'
      ])
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
