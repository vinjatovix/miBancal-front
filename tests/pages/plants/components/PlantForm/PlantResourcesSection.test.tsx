import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PlantResourcesSection } from '../../../../../src/pages/plants/components/PlantForm/PlantResourcesSection';
import { initialPlantFormState } from '../../../../../src/pages/plants/components/PlantForm/utils/plantFormMappers';

describe('PlantResourcesSection', () => {
  it('renders primary image inputs and empty messages for videos and articles', () => {
    const values = initialPlantFormState();

    render(
      <PlantResourcesSection values={values} errors={{}} onChange={vi.fn()} />
    );

    expect(
      screen.getByLabelText(/url de la fotografía principal/i)
    ).toBeInTheDocument();
    expect(screen.getByText('No hay vídeos vinculados.')).toBeInTheDocument();
    expect(
      screen.getByText('No hay artículos vinculados.')
    ).toBeInTheDocument();
  });

  it('calls onChange with new video item when add video is clicked', async () => {
    const user = userEvent.setup();
    const values = initialPlantFormState();
    const onChange = vi.fn();

    render(
      <PlantResourcesSection values={values} errors={{}} onChange={onChange} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Añadir enlace de vídeo' })
    );

    expect(onChange).toHaveBeenCalledWith(
      'videoResources',
      expect.arrayContaining([expect.objectContaining({ url: '', title: '' })])
    );
  });

  it('calls onChange with updated video url when typing in video url input', async () => {
    const user = userEvent.setup();
    const values = {
      ...initialPlantFormState(),
      videoResources: [
        {
          id: 'v-1',
          url: '',
          title: ''
        }
      ]
    };
    const onChange = vi.fn();

    render(
      <PlantResourcesSection values={values} errors={{}} onChange={onChange} />
    );

    const input = screen.getByPlaceholderText(
      'https://www.youtube.com/watch?v=...'
    );
    await user.type(input, 'https://www.youtube.com/watch?v=123');

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange to remove video when remove button is clicked', async () => {
    const user = userEvent.setup();
    const values = {
      ...initialPlantFormState(),
      videoResources: [
        {
          id: 'v-1',
          url: 'https://www.youtube.com/watch?v=1',
          title: 'V1'
        }
      ]
    };
    const onChange = vi.fn();

    render(
      <PlantResourcesSection values={values} errors={{}} onChange={onChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar vídeo' }));

    expect(onChange).toHaveBeenCalledWith('videoResources', []);
  });

  it('calls onChange with new article item when add article is clicked', async () => {
    const user = userEvent.setup();
    const values = initialPlantFormState();
    const onChange = vi.fn();

    render(
      <PlantResourcesSection values={values} errors={{}} onChange={onChange} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Añadir enlace de artículo' })
    );

    expect(onChange).toHaveBeenCalledWith(
      'articleResources',
      expect.arrayContaining([expect.objectContaining({ url: '', title: '' })])
    );
  });

  it('displays validation error alert when video url has error', () => {
    const values = {
      ...initialPlantFormState(),
      videoResources: [
        {
          id: 'v-1',
          url: 'not-a-url',
          title: 'V1'
        }
      ]
    };
    const errors = {
      videoUrl_0: 'La URL debe comenzar por http:// o https://'
    };

    render(
      <PlantResourcesSection
        values={values}
        errors={errors}
        onChange={vi.fn()}
      />
    );

    expect(
      screen.getByText('La URL debe comenzar por http:// o https://')
    ).toBeInTheDocument();
  });
});
