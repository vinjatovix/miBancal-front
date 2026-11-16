import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AnomalyImageCarousel } from '../../../../../src/pages/anomalies/AnomalyDetail/components/AnomalyImageCarousel';
import type { SupportResource } from '../../../../../src/types/SupportResource';

const testImages: SupportResource[] = [
  {
    type: 'image',
    url: 'https://images.example.com/pulgon-1.jpg',
    title: 'Colonia de pulgón verde',
    source: 'INIA'
  },
  {
    type: 'image',
    url: 'https://images.example.com/pulgon-2.jpg',
    title: 'Detalle de hojas deformadas',
    source: 'Banco de imágenes'
  },
  {
    type: 'image',
    url: 'https://images.example.com/pulgon-3.jpg',
    title: 'Adulto alado'
  }
];

describe('AnomalyImageCarousel', () => {
  it('renders carousel container with region role and accessible label', () => {
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const region = screen.getByRole('region', {
      name: 'Galería de imágenes de la anomalía'
    });

    expect(region).toBeInTheDocument();
  });

  it('displays the first image initially with correct alt text and src', () => {
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const img = screen.getByAltText('Colonia de pulgón verde');

    expect(img).toHaveAttribute(
      'src',
      'https://images.example.com/pulgon-1.jpg'
    );
  });

  it('renders previous and next navigation buttons', () => {
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const prevButton = screen.getByRole('button', { name: 'Imagen anterior' });
    const nextButton = screen.getByRole('button', { name: 'Imagen siguiente' });

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('renders indicator dots for all images with active state on the first dot', () => {
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const firstDot = screen.getByRole('button', {
      name: 'Ir a la imagen 1 de 3'
    });
    const secondDot = screen.getByRole('button', {
      name: 'Ir a la imagen 2 de 3'
    });

    expect(firstDot).toHaveAttribute('aria-current', 'true');
    expect(secondDot).not.toHaveAttribute('aria-current');
  });

  it('navigates to next image when clicking next button', async () => {
    const user = userEvent.setup();
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const nextButton = screen.getByRole('button', { name: 'Imagen siguiente' });
    await user.click(nextButton);

    const activeImage = screen.getByAltText('Detalle de hojas deformadas');
    expect(activeImage).toBeInTheDocument();
  });

  it('navigates to previous image wrapping around to last image when clicking previous on first image', async () => {
    const user = userEvent.setup();
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const prevButton = screen.getByRole('button', { name: 'Imagen anterior' });
    await user.click(prevButton);

    const activeImage = screen.getByAltText('Adulto alado');
    expect(activeImage).toBeInTheDocument();
  });

  it('wraps around to first image when clicking next on the last image', async () => {
    const user = userEvent.setup();
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const nextButton = screen.getByRole('button', { name: 'Imagen siguiente' });
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    const activeImage = screen.getByAltText('Colonia de pulgón verde');
    expect(activeImage).toBeInTheDocument();
  });

  it('navigates directly to an image when clicking its indicator dot', async () => {
    const user = userEvent.setup();
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const thirdDot = screen.getByRole('button', {
      name: 'Ir a la imagen 3 de 3'
    });
    await user.click(thirdDot);

    const activeImage = screen.getByAltText('Adulto alado');
    expect(activeImage).toBeInTheDocument();
  });

  it('navigates to next and previous image via ArrowRight and ArrowLeft keyboard keys', async () => {
    const user = userEvent.setup();
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const region = screen.getByRole('region', {
      name: 'Galería de imágenes de la anomalía'
    });
    region.focus();
    await user.keyboard('{ArrowRight}');

    expect(
      screen.getByAltText('Detalle de hojas deformadas')
    ).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');

    expect(screen.getByAltText('Colonia de pulgón verde')).toBeInTheDocument();
  });

  it('renders caption title and source attribution when present', () => {
    render(
      <AnomalyImageCarousel images={testImages} anomalyName="Pulgón verde" />
    );

    const titleElement = screen.getByText('Colonia de pulgón verde');
    const sourceElement = screen.getByText('Fuente: INIA');

    expect(titleElement).toBeInTheDocument();
    expect(sourceElement).toBeInTheDocument();
  });
});
