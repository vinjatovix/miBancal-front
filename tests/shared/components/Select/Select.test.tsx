import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Select, {
  type SelectOption
} from '../../../../src/shared/components/Select/Select';

describe('Select', () => {
  const sampleOptions: readonly SelectOption[] = [
    { value: 'opt-1', label: 'Opción 1' },
    { value: 'opt-2', label: 'Opción 2' },
    { value: 'opt-3', label: 'Opción 3', disabled: true }
  ];

  it('renders select with default md size class', () => {
    render(<Select aria-label="Selector de prueba" />);

    const select = screen.getByRole('combobox', { name: 'Selector de prueba' });

    expect(select).toBeInTheDocument();
    expect(select).toHaveClass('app-select');
    expect(select).toHaveClass('app-select--md');
  });

  it('renders provided options', () => {
    render(<Select aria-label="Selector de prueba" options={sampleOptions} />);

    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue('opt-1');
    expect(options[0]).toHaveTextContent('Opción 1');
    expect(options[2]).toBeDisabled();
  });

  it('renders placeholder option as first entry when provided', () => {
    render(
      <Select
        aria-label="Selector de prueba"
        placeholder="Selecciona una opción"
        options={sampleOptions}
      />
    );

    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue('');
    expect(options[0]).toHaveTextContent('Selecciona una opción');
  });

  it('renders children elements inside select', () => {
    render(
      <Select aria-label="Selector de prueba">
        <option value="custom">Opción personalizada</option>
      </Select>
    );

    const option = screen.getByRole('option', { name: 'Opción personalizada' });

    expect(option).toBeInTheDocument();
    expect(option).toHaveValue('custom');
  });

  it.each([
    ['sm', 'app-select--sm'],
    ['md', 'app-select--md'],
    ['lg', 'app-select--lg']
  ] as const)('applies %s size variant class', (size, expectedClass) => {
    render(<Select aria-label="Selector de prueba" selectSize={size} />);

    const select = screen.getByRole('combobox', { name: 'Selector de prueba' });

    expect(select).toHaveClass(expectedClass);
  });

  it('applies invalid attribute and styling class when isInvalid is true', () => {
    render(<Select aria-label="Selector de prueba" isInvalid />);

    const select = screen.getByRole('combobox', { name: 'Selector de prueba' });

    expect(select).toBeInvalid();
    expect(select).toHaveClass('app-select--invalid');
  });

  it('applies invalid attribute and styling class when aria-invalid is string true', () => {
    render(<Select aria-label="Selector de prueba" aria-invalid="true" />);

    const select = screen.getByRole('combobox', { name: 'Selector de prueba' });

    expect(select).toBeInvalid();
    expect(select).toHaveClass('app-select--invalid');
  });

  it('does not apply invalid styling when aria-invalid is false', () => {
    render(<Select aria-label="Selector de prueba" aria-invalid="false" />);

    const select = screen.getByRole('combobox', { name: 'Selector de prueba' });

    expect(select).not.toBeInvalid();
    expect(select).not.toHaveClass('app-select--invalid');
  });

  it('forwards ref to underlying select DOM element', () => {
    const selectRef = createRef<HTMLSelectElement>();

    render(<Select ref={selectRef} aria-label="Selector de prueba" />);

    expect(selectRef.current).toBeInstanceOf(HTMLSelectElement);
  });

  it('triggers onChange handler when value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select
        aria-label="Selector de prueba"
        options={sampleOptions}
        onChange={handleChange}
      />
    );

    const select = screen.getByRole('combobox', { name: 'Selector de prueba' });
    await user.selectOptions(select, 'opt-2');

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue('opt-2');
  });

  it('disables select when disabled prop is true', () => {
    render(<Select aria-label="Selector de prueba" disabled />);

    const select = screen.getByRole('combobox', { name: 'Selector de prueba' });

    expect(select).toBeDisabled();
  });

  it('merges custom className with default classes', () => {
    render(
      <Select aria-label="Selector de prueba" className="custom-select-class" />
    );

    const select = screen.getByRole('combobox', { name: 'Selector de prueba' });

    expect(select).toHaveClass('app-select');
    expect(select).toHaveClass('custom-select-class');
  });
});
