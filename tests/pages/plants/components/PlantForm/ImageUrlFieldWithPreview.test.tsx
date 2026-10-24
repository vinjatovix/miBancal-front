import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ImageUrlFieldWithPreview } from '../../../../../src/pages/plants/components/PlantForm/ImageUrlFieldWithPreview';

describe('ImageUrlFieldWithPreview', () => {
  it('renders input with accessible label', () => {
    const onChange = vi.fn();

    render(
      <ImageUrlFieldWithPreview
        label="URL de la fotografía principal"
        url=""
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('URL de la fotografía principal');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when user types a new URL', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ImageUrlFieldWithPreview label="URL" url="" onChange={onChange} />);

    const input = screen.getByLabelText('URL');
    await user.type(input, 'https://example.com/plant.jpg');

    expect(onChange).toHaveBeenCalled();
  });

  it('renders image thumbnail with fixed dimensions when URL starts with http', () => {
    render(
      <ImageUrlFieldWithPreview
        label="URL"
        url="https://example.com/plant.jpg"
        onChange={vi.fn()}
      />
    );

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/plant.jpg');
    expect(image).toHaveAttribute('width', '120');
    expect(image).toHaveAttribute('height', '120');
  });

  it('renders image error fallback when image fails to load', () => {
    render(
      <ImageUrlFieldWithPreview
        label="URL"
        url="https://example.com/broken.jpg"
        onChange={vi.fn()}
      />
    );

    const image = screen.getByRole('img');
    fireEvent.error(image);

    const errorNotice = screen.getByRole('alert');
    expect(errorNotice).toBeInTheDocument();
  });

  it('displays field validation error when provided', () => {
    render(
      <ImageUrlFieldWithPreview
        label="URL"
        url=""
        error="Campo requerido"
        onChange={vi.fn()}
      />
    );

    const input = screen.getByLabelText('URL');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });
});
