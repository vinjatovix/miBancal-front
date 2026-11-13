import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Drawer from '../../../src/shared/components/Drawer/Drawer';

describe('Drawer', () => {
  it('should render children when open', () => {
    render(
      <Drawer isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Drawer>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should not render overlay when closed', () => {
    const { container } = render(
      <Drawer isOpen={false} onClose={() => {}}>
        <div>Content</div>
      </Drawer>
    );

    expect(container.querySelector('.drawer-overlay')).toBeNull();
  });

  it('should render overlay when open', () => {
    render(
      <Drawer isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Drawer>
    );

    expect(document.querySelector('.drawer-overlay')).toBeInTheDocument();
  });

  it('should call onClose when clicking overlay', () => {
    const onClose = vi.fn();

    render(
      <Drawer isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    );

    const overlay = document.querySelector('.drawer-overlay') as HTMLElement;

    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('names the overlay close button in Spanish', () => {
    const onClose = vi.fn();

    render(
      <Drawer isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close on Escape key', () => {
    const onClose = vi.fn();

    render(
      <Drawer isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should apply custom width via CSS variable', () => {
    render(
      <Drawer isOpen={true} onClose={() => {}} width={500}>
        <div>Content</div>
      </Drawer>
    );

    const aside = document.querySelector('.drawer-panel') as HTMLElement;

    expect(aside.style.getPropertyValue('--drawer-width')).toBe('500px');
  });

  it.each([
    ['left position by default', { isOpen: true }, 'drawer-left'],
    [
      'right position when specified',
      { isOpen: true, position: 'right' as const },
      'drawer-right'
    ],
    ['open class when isOpen is true', { isOpen: true }, 'drawer-open'],
    ['closed class when isOpen is false', { isOpen: false }, 'drawer-closed']
  ])('should apply %s class', (_, props, expectedClass) => {
    render(
      <Drawer onClose={() => {}} {...props}>
        <div>Content</div>
      </Drawer>
    );

    const aside = document.querySelector('.drawer-panel');
    expect(aside?.className).toContain(expectedClass);
  });
});
