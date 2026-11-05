import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { GardenInputResources } from '../../../../../src/pages/gardenInputs/GardenInputDetail/components/GardenInputResources';
import type { SupportResource } from '../../../../../src/types/SupportResource';

describe('GardenInputResources', () => {
  it('returns null when resources is undefined', () => {
    const { container } = render(
      <GardenInputResources resources={undefined} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when resources array contains only images', () => {
    const resources: SupportResource[] = [
      {
        type: 'image',
        url: 'https://images.example.com/purin.jpg'
      }
    ];

    const { container } = render(
      <GardenInputResources resources={resources} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders youtube video iframe with secure attributes and lazy loading', () => {
    const resources: SupportResource[] = [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=purin123',
        title: 'Elaboración del purín'
      }
    ];

    render(<GardenInputResources resources={resources} />);

    const iframe = screen.getByTitle('Elaboración del purín');

    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/purin123'
    );
    expect(iframe).toHaveAttribute('loading', 'lazy');
    expect(iframe).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-presentation'
    );
  });

  it('renders article link with target blank, rel noopener noreferrer and source', () => {
    const resources: SupportResource[] = [
      {
        type: 'article',
        url: 'https://extension.example.org/purin',
        title: 'Guía de preparados vegetales',
        source: 'INIA'
      }
    ];

    render(<GardenInputResources resources={resources} />);

    const link = screen.getByRole('link', {
      name: /Guía de preparados vegetales/
    });

    expect(link).toHaveAttribute('href', 'https://extension.example.org/purin');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('(INIA)')).toBeInTheDocument();
  });

  it('switches between video and article tabs when both types are present', async () => {
    const user = userEvent.setup();
    const resources: SupportResource[] = [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=purin123',
        title: 'Vídeo explicativo'
      },
      {
        type: 'article',
        url: 'https://extension.example.org/purin',
        title: 'Artículo técnico'
      }
    ];

    render(<GardenInputResources resources={resources} />);

    expect(screen.getByTitle('Vídeo explicativo')).toBeInTheDocument();

    const articlesTab = screen.getByRole('tab', { name: /Artículos/ });
    await user.click(articlesTab);

    expect(
      screen.getByRole('link', { name: /Artículo técnico/ })
    ).toBeInTheDocument();
  });

  it('omits invalid video urls without breaking other resources', () => {
    const resources: SupportResource[] = [
      {
        type: 'video',
        url: 'https://invalid-video-host.com/123'
      },
      {
        type: 'article',
        url: 'https://extension.example.org/purin',
        title: 'Artículo técnico'
      }
    ];

    render(<GardenInputResources resources={resources} />);

    const articlesTab = screen.getByRole('tab', { name: /Artículos/ });
    expect(articlesTab).toBeInTheDocument();
    expect(screen.queryByRole('iframe')).not.toBeInTheDocument();
  });
});
