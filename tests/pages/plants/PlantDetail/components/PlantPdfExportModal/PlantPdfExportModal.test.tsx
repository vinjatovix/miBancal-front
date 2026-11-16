import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PlantPdfExportModal from '../../../../../../src/pages/plants/PlantDetail/components/PlantPdfExportModal/PlantPdfExportModal';
import type { Plant } from '../../../../../../src/types/Plants/Plant';
import { toastStore } from '../../../../../../src/shared/toast/toastStore';
import { buildPlant } from '../../../../../fixtures/plants/buildPlant';
import '../../../../../../src/i18n/messages/plant';

const exportMock = vi.fn();
const loadImageMock = vi.fn();

vi.mock('../../../../../../src/services/pdf/plantPdfExport.service', () => ({
  exportPlantToPdf: (...args: unknown[]) => exportMock(...args)
}));

vi.mock('../../../../../../src/services/pdf/utils/loadRemoteImage', () => ({
  loadRemoteImage: (...args: unknown[]) => loadImageMock(...args)
}));

function renderModal(
  onClose: () => void = vi.fn(),
  plant: Plant = buildPlant()
) {
  return render(<PlantPdfExportModal isOpen onClose={onClose} plant={plant} />);
}

describe('PlantPdfExportModal', () => {
  beforeEach(() => {
    toastStore.clearToasts();
    exportMock.mockReset();
    exportMock.mockResolvedValue({
      success: true,
      filename: 'perejil-2026-11-09.pdf',
      pageCount: 1
    });
    loadImageMock.mockReset();
    loadImageMock.mockResolvedValue({
      dataUrl: 'data:image/jpeg;base64,AAAA',
      widthPx: 300,
      heightPx: 200
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an accessible dialog with a labelled title', () => {
    renderModal();

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(
      screen.getByRole('heading', { name: 'Exportar ficha de la planta a PDF' })
    ).toBeInTheDocument();
  });

  it('groups the section checkboxes and marks them all by default', () => {
    renderModal();

    const group = screen.getByRole('group', { name: 'Secciones de la ficha' });
    const checkboxes = within(group).getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(8);
    checkboxes.forEach((checkbox) => expect(checkbox).toBeChecked());
    expect(screen.getByRole('button', { name: /Descargar PDF/ })).toBeEnabled();
  });

  it('disables download when every section is deselected', async () => {
    renderModal();
    const user = userEvent.setup();
    const group = screen.getByRole('group', { name: 'Secciones de la ficha' });

    for (const checkbox of within(group).getAllByRole('checkbox')) {
      await user.click(checkbox);
    }

    expect(
      screen.getByRole('button', { name: /Descargar PDF/ })
    ).toBeDisabled();
  });

  it('resolves the image, exports and closes on a successful download', async () => {
    const onClose = vi.fn();
    renderModal(onClose);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Descargar PDF/ }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(loadImageMock).toHaveBeenCalled();
    expect(exportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          imageDataUrl: 'data:image/jpeg;base64,AAAA'
        })
      })
    );
    expect(toastStore.getSnapshot().map((toast) => toast.message)).toEqual([
      'Ficha de la planta descargada en PDF con éxito'
    ]);
  });

  it('offers exporting without the image when the image cannot be loaded', async () => {
    loadImageMock.mockRejectedValueOnce(new Error('remote-image-load'));
    const onClose = vi.fn();
    renderModal(onClose);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Descargar PDF/ }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/No se pudo incluir la imagen principal/);
    expect(exportMock).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole('button', { name: 'Exportar sin imagen' })
    );

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(exportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ imageDataUrl: null })
      })
    );
  });

  it('shows the localized error and keeps the modal open when generation fails', async () => {
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
