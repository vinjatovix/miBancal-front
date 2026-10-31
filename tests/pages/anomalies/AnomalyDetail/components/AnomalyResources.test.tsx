import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AnomalyResources } from '../../../../../src/pages/anomalies/AnomalyDetail/components/AnomalyResources';
import type { SupportResource } from '../../../../../src/types/SupportResource';

describe('AnomalyResources', () => {
  it('returns null when resources is undefined', () => {
    const { container } = render(<AnomalyResources resources={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when resources array contains only images', () => {
    const resources: SupportResource[] = [
      {
        type: 'image',
        url: 'https://images.example.com/pulgon.jpg'
      }
    ];

    const { container } = render(<AnomalyResources resources={resources} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders youtube video iframe with secure attributes and lazy loading', () => {
    const resources: SupportResource[] = [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=pulgon123',
        title: 'Identificación en campo'
      }
    ];

    render(<AnomalyResources resources={resources} />);

    const iframe = screen.getByTitle('Identificación en campo');

    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/pulgon123'
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
        url: 'https://extension.example.org/pulgon',
        title: 'Manejo integrado de plagas',
        source: 'INIA'
      }
    ];

    render(<AnomalyResources resources={resources} />);

    const link = screen.getByRole('link', {
      name: /Manejo integrado de plagas/
    });

    expect(link).toHaveAttribute(
      'href',
      'https://extension.example.org/pulgon'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('(INIA)')).toBeInTheDocument();
  });

  it('switches between video and article tabs when both types are present', async () => {
    const user = userEvent.setup();
    const resources: SupportResource[] = [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=pulgon123',
        title: 'Vídeo explicativo'
      },
      {
        type: 'article',
        url: 'https://extension.example.org/pulgon',
        title: 'Artículo técnico'
      }
    ];

    render(<AnomalyResources resources={resources} />);

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
        url: 'https://extension.example.org/pulgon',
        title: 'Artículo técnico'
      }
    ];

    render(<AnomalyResources resources={resources} />);

    const articlesTab = screen.getByRole('tab', { name: /Artículos/ });
    expect(articlesTab).toBeInTheDocument();
    expect(screen.queryByRole('iframe')).not.toBeInTheDocument();
  });
});
