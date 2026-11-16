import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LocationLayoutTopBar, {
  type LocationLayoutTopBarProps
} from '../../../../../src/pages/locations/LocationLayoutPage/components/LocationLayoutTopBar';
import '../../../../../src/i18n/messages/beds';

function buildProps(
  overrides: Partial<LocationLayoutTopBarProps> = {}
): LocationLayoutTopBarProps {
  return {
    mode: 'read',
    onModeChange: vi.fn(),
    isPlanting: false,
    isPosition: false,
    toolMode: 'select',
    onSelectToolMode: vi.fn(),
    isSavingPlacement: false,
    hasPlantingChanges: false,
    pendingPlantingCount: 0,
    onSavePlanting: vi.fn(),
    onDiscardPlanting: vi.fn(),
    hasPositionChanges: false,
    isSavingPosition: false,
    onSavePosition: vi.fn(),
    onDiscardPosition: vi.fn(),
    gridSnapEnabled: false,
    onToggleGridSnap: vi.fn(),
    neighborSnapEnabled: false,
    onToggleNeighborSnap: vi.fn(),
    onExportPdf: vi.fn(),
    ...overrides
  };
}

describe('LocationLayoutTopBar export action', () => {
  it('renders the export button', () => {
    render(<LocationLayoutTopBar {...buildProps()} />);

    expect(
      screen.getByRole('button', { name: 'Exportar a PDF' })
    ).toBeInTheDocument();
  });

  it('invokes the export callback on click', async () => {
    const onExportPdf = vi.fn();
    render(<LocationLayoutTopBar {...buildProps({ onExportPdf })} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Exportar a PDF' })
    );

    expect(onExportPdf).toHaveBeenCalledTimes(1);
  });

  it('disables the export button when requested', () => {
    render(<LocationLayoutTopBar {...buildProps({ exportDisabled: true })} />);

    expect(
      screen.getByRole('button', { name: 'Exportar a PDF' })
    ).toBeDisabled();
  });
});

describe('LocationLayoutTopBar snap toggles', () => {
  it('shows magnet snap toggles only in position mode', () => {
    const { rerender } = render(
      <LocationLayoutTopBar {...buildProps({ isPosition: false })} />
    );

    expect(
      screen.queryByRole('group', { name: 'Ajuste magnético' })
    ).not.toBeInTheDocument();

    rerender(<LocationLayoutTopBar {...buildProps({ isPosition: true })} />);

    expect(
      screen.getByRole('group', { name: 'Ajuste magnético' })
    ).toBeInTheDocument();
  });

  it('toggles grid snap from the top bar in position mode', async () => {
    const onToggleGridSnap = vi.fn();
    render(
      <LocationLayoutTopBar
        {...buildProps({ isPosition: true, onToggleGridSnap })}
      />
    );

    await userEvent.click(
      screen.getByRole('switch', { name: 'Ajustar a la rejilla' })
    );

    expect(onToggleGridSnap).toHaveBeenCalledTimes(1);
  });

  it('no longer renders the standalone layers popover trigger', () => {
    render(<LocationLayoutTopBar {...buildProps({ isPosition: true })} />);

    expect(
      screen.queryByRole('button', { name: 'Capas' })
    ).not.toBeInTheDocument();
  });

  it('passes iconOnly to snap toggles when isMobile is true in position mode', () => {
    render(
      <LocationLayoutTopBar
        {...buildProps({ isPosition: true, isMobile: true })}
      />
    );

    expect(screen.queryByText('Rejilla')).not.toBeInTheDocument();
    expect(screen.queryByText('Bancales')).not.toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Ajustar a la rejilla' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Ajustar a bancales vecinos' })
    ).toBeInTheDocument();
  });

  it('renders visible short labels for snap toggles when isMobile is false in position mode', () => {
    render(
      <LocationLayoutTopBar
        {...buildProps({ isPosition: true, isMobile: false })}
      />
    );

    expect(screen.getByText('Rejilla')).toBeInTheDocument();
    expect(screen.getByText('Bancales')).toBeInTheDocument();
  });
});
