import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TermHelp from '../../../../src/shared/components/TermHelp/TermHelp';
import { reportMissingTranslation } from '../../../../src/shared/observability/reportMissingTranslation';
import { expectNoAxeViolations } from '../../../test-utils/axe';

vi.mock(
  '../../../../src/shared/observability/reportMissingTranslation',
  () => ({
    reportMissingTranslation: vi.fn()
  })
);

afterEach(() => {
  vi.mocked(reportMissingTranslation).mockClear();
});

function getTrigger(): HTMLElement {
  return screen.getByRole('button', { name: 'Qué significa fenología' });
}

describe('TermHelp', () => {
  it('renders a collapsed help trigger for a known term', () => {
    render(<TermHelp termKey="phenology" />);

    const trigger = getTrigger();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('opens the definition on click and wires aria-controls', async () => {
    const user = userEvent.setup();
    render(<TermHelp termKey="phenology" />);

    const trigger = getTrigger();
    await user.click(trigger);

    const popover = screen.getByRole('note', { name: 'fenología' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', popover.id);
    expect(screen.getByText(/cuándo florece/i)).toBeInTheDocument();
  });

  it('closes with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<TermHelp termKey="phenology" />);

    const trigger = getTrigger();
    await user.click(trigger);
    expect(screen.getByRole('note')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('closes with the accessible close control', async () => {
    const user = userEvent.setup();
    render(<TermHelp termKey="phenology" />);

    await user.click(getTrigger());
    await user.click(
      screen.getByRole('button', { name: 'Cerrar la explicación' })
    );

    await waitFor(() => {
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });
  });

  it('has no axe violations when open', async () => {
    const user = userEvent.setup();
    const { container } = render(<TermHelp termKey="phenology" />);

    await user.click(getTrigger());

    await expectNoAxeViolations(container);
  });

  it('does not throw and reports when the term is missing', () => {
    expect(() => render(<TermHelp termKey="does-not-exist" />)).not.toThrow();

    expect(reportMissingTranslation).toHaveBeenCalledWith(
      'glossary.terms.does-not-exist.definition'
    );
    expect(
      screen.queryByRole('button', { name: /Qué significa/i })
    ).not.toBeInTheDocument();
  });
});
