import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import PdfExportModalShell, {
  type PdfExportModalLabels,
  type PdfExportModalShellProps
} from '../../../../src/shared/components/PdfExport/PdfExportModalShell';
import { t } from '../../../../src/i18n/core/t';
import '../../../../src/i18n/messages/plant';

const LABELS: PdfExportModalLabels = {
  title: 'plant.export.modal_title',
  subtitle: 'plant.export.modal_subtitle',
  cancel: 'plant.export.action_cancel',
  download: 'plant.export.action_download',
  generating: 'plant.export.generating'
};

function renderShell(overrides: Partial<PdfExportModalShellProps> = {}) {
  const props: PdfExportModalShellProps = {
    isOpen: true,
    onClose: vi.fn(),
    labels: LABELS,
    canDownload: true,
    isBusy: false,
    showSpinner: false,
    onDownload: vi.fn(),
    children: <p>shell-body</p>,
    ...overrides
  };
  render(<PdfExportModalShell {...props} />);
  return props;
}

const downloadName = () => t('plant.export.action_download');
const cancelName = () => t('plant.export.action_cancel');

describe('PdfExportModalShell', () => {
  it('renders a titled dialog with the children and footer actions', () => {
    renderShell();

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(
      screen.getByRole('heading', { name: t('plant.export.modal_title') })
    ).toBeInTheDocument();
    expect(screen.getByText('shell-body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cancelName() })).toBeEnabled();
    expect(screen.getByRole('button', { name: downloadName() })).toBeEnabled();
  });

  it('disables the download action when canDownload is false', () => {
    renderShell({ canDownload: false });

    expect(screen.getByRole('button', { name: downloadName() })).toBeDisabled();
  });

  it('disables both actions while busy', () => {
    renderShell({ isBusy: true });

    expect(screen.getByRole('button', { name: cancelName() })).toBeDisabled();
    expect(screen.getByRole('button', { name: downloadName() })).toBeDisabled();
  });

  it('swaps the download label for the generating label while the spinner is active', () => {
    renderShell({ showSpinner: true });

    expect(screen.queryByRole('button', { name: downloadName() })).toBeNull();
    expect(
      screen.getByRole('button', { name: t('plant.export.generating') })
    ).toBeInTheDocument();
  });

  it('routes the footer buttons to their handlers', async () => {
    const props = renderShell();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: downloadName() }));
    expect(props.onDownload).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: cancelName() }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
