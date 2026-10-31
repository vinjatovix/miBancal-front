import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import UpdatePrompt from '../../../src/components/UpdatePrompt/UpdatePrompt';
import { t } from '../../../src/i18n/core/t';

const mockUpdateServiceWorker = vi.fn();
let mockNeedRefresh = false;

vi.mock('../../../src/shared/sw/registration', () => ({
  useSWUpdate: () => ({
    needRefresh: mockNeedRefresh,
    updateServiceWorker: mockUpdateServiceWorker
  })
}));

describe('UpdatePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNeedRefresh = false;
  });

  it('renders nothing when needRefresh is false', () => {
    mockNeedRefresh = false;

    render(<UpdatePrompt />);

    const alert = screen.queryByRole('alert');

    expect(alert).not.toBeInTheDocument();
  });

  it('renders update toast message when needRefresh is true', () => {
    mockNeedRefresh = true;

    render(<UpdatePrompt />);

    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent(t('sw.update.title'));
  });

  it('renders update action button when needRefresh is true', () => {
    mockNeedRefresh = true;

    render(<UpdatePrompt />);

    const button = screen.getByRole('button', {
      name: t('sw.update.action')
    });

    expect(button).toBeInTheDocument();
  });

  it('calls updateServiceWorker with true when update action button is clicked', async () => {
    const user = userEvent.setup();
    mockNeedRefresh = true;
    render(<UpdatePrompt />);
    const button = screen.getByRole('button', {
      name: t('sw.update.action')
    });

    await user.click(button);

    expect(mockUpdateServiceWorker).toHaveBeenCalledExactlyOnceWith(true);
  });
});
