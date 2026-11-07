import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import BedCompassHud from '../../../../src/components/beds/layout/BedCompassHud';

describe('BedCompassHud in read mode', () => {
  it('renders a region container with accessible compass label', () => {
    render(<BedCompassHud northAngle={null} bedAzimuth={null} mode="read" />);

    const region = screen.getByRole('region', {
      name: 'Brújula y orientación cardinal'
    });
    expect(region).toBeInTheDocument();
  });

  it('does not trigger rotation on pointer interaction in read mode', () => {
    const onNorthAngleChange = vi.fn();
    render(
      <BedCompassHud
        northAngle={0}
        bedAzimuth={null}
        mode="read"
        onNorthAngleChange={onNorthAngleChange}
      />
    );
    const dial = screen.getByRole('spinbutton');
    vi.spyOn(dial, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    });

    fireEvent.pointerDown(dial, { clientX: 150, clientY: 150, button: 0 });
    fireEvent.pointerMove(dial, { clientX: 200, clientY: 150 });

    expect(onNorthAngleChange).not.toHaveBeenCalled();
  });

  it('displays default vertical north text and zero needle rotation when unselected and northAngle is null', () => {
    const { container } = render(
      <BedCompassHud northAngle={null} bedAzimuth={null} mode="read" />
    );

    expect(
      screen.getByText('Norte estándar del plano (0°)')
    ).toBeInTheDocument();
    const northNeedle = container.querySelector(
      '.bed-compass-hud__needle--north'
    );
    expect(northNeedle?.getAttribute('transform')).toBe('rotate(0 48 48)');
  });

  it('displays terrain north angle and rotates north needle when northAngle is set', () => {
    const { container } = render(
      <BedCompassHud northAngle={45} bedAzimuth={null} mode="read" />
    );

    expect(screen.getByText('Norte del terreno: 45°')).toBeInTheDocument();
    const northNeedle = container.querySelector(
      '.bed-compass-hud__needle--north'
    );
    expect(northNeedle?.getAttribute('transform')).toBe('rotate(45 48 48)');
  });

  it('displays bed heading title with azimuth and wind name when a bed is selected', () => {
    const { container } = render(
      <BedCompassHud northAngle={0} bedAzimuth={90} mode="read" />
    );

    expect(screen.getByText('Rumbo del bancal: 90° Este')).toBeInTheDocument();
    const bedNeedle = container.querySelector('.bed-compass-hud__needle--bed');
    expect(bedNeedle?.getAttribute('transform')).toBe('rotate(90 48 48)');
  });

  it('exposes spinbutton accessible attributes with current angle and wind in aria-valuetext', () => {
    render(<BedCompassHud northAngle={0} bedAzimuth={135} mode="read" />);

    const spinbutton = screen.getByRole('spinbutton');
    expect(spinbutton).toHaveAttribute('aria-readonly', 'true');
    expect(spinbutton).toHaveAttribute('aria-valuenow', '135');
    expect(spinbutton).toHaveAttribute('aria-valuemin', '0');
    expect(spinbutton).toHaveAttribute('aria-valuemax', '359');
    expect(spinbutton).toHaveAttribute('aria-valuetext', '135° Sureste');
  });
});

describe('BedCompassHud in position mode', () => {
  it.each([
    ['ArrowUp', false, 46],
    ['ArrowRight', false, 46],
    ['ArrowDown', false, 44],
    ['ArrowLeft', false, 44],
    ['ArrowUp', true, 60],
    ['ArrowDown', true, 30]
  ])(
    'rotates selected bed on key %s with shift=%s',
    async (key, shiftKey, expectedRotation) => {
      const onBedRotationChange = vi.fn();
      const user = userEvent.setup();

      render(
        <BedCompassHud
          northAngle={0}
          bedAzimuth={45}
          mode="position"
          onBedRotationChange={onBedRotationChange}
        />
      );

      const dial = screen.getByRole('spinbutton');
      await user.click(dial);
      await user.keyboard(shiftKey ? `{Shift>}{${key}}{/Shift}` : `{${key}}`);

      expect(onBedRotationChange).toHaveBeenCalledWith(expectedRotation);
    }
  );

  it.each([
    ['ArrowUp', false, 1],
    ['ArrowRight', false, 1],
    ['ArrowDown', false, 359],
    ['ArrowLeft', false, 359],
    ['ArrowUp', true, 15],
    ['ArrowDown', true, 345]
  ])(
    'calibrates terrain north on key %s with shift=%s when no bed selected',
    async (key, shiftKey, expectedNorthAngle) => {
      const onNorthAngleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <BedCompassHud
          northAngle={0}
          bedAzimuth={null}
          mode="position"
          onNorthAngleChange={onNorthAngleChange}
        />
      );

      const dial = screen.getByRole('spinbutton');
      await user.click(dial);
      await user.keyboard(shiftKey ? `{Shift>}{${key}}{/Shift}` : `{${key}}`);

      expect(onNorthAngleChange).toHaveBeenCalledWith(expectedNorthAngle);
    }
  );

  it('triggers onSaveNorthAngle when clicking save button', async () => {
    const onSaveNorthAngle = vi.fn();
    const user = userEvent.setup();

    render(
      <BedCompassHud
        northAngle={45}
        bedAzimuth={null}
        mode="position"
        onSaveNorthAngle={onSaveNorthAngle}
      />
    );

    const saveBtn = screen.getByRole('button', {
      name: 'Guardar'
    });
    await user.click(saveBtn);

    expect(onSaveNorthAngle).toHaveBeenCalledOnce();
  });

  it('disables save button and displays saving text when isSavingNorth is true', () => {
    render(
      <BedCompassHud
        northAngle={45}
        bedAzimuth={null}
        mode="position"
        onSaveNorthAngle={vi.fn()}
        isSavingNorth={true}
      />
    );

    const saveBtn = screen.getByRole('button', {
      name: 'Guardando...'
    });
    expect(saveBtn).toBeDisabled();
  });

  it('displays drag hint text in position mode', () => {
    render(<BedCompassHud northAngle={0} bedAzimuth={null} mode="position" />);

    const hint = screen.getByText('Arrastra para girar');

    expect(hint).toBeInTheDocument();
  });

  it('does not change angle when pointer movement is below drag threshold', () => {
    const onNorthAngleChange = vi.fn();
    render(
      <BedCompassHud
        northAngle={0}
        bedAzimuth={null}
        mode="position"
        onNorthAngleChange={onNorthAngleChange}
      />
    );
    const dial = screen.getByRole('spinbutton');
    vi.spyOn(dial, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    });

    fireEvent.pointerDown(dial, { clientX: 150, clientY: 150, button: 0 });
    fireEvent.pointerMove(dial, { clientX: 151, clientY: 151 });

    expect(onNorthAngleChange).not.toHaveBeenCalled();
  });

  it.each([
    [200, 150, 90],
    [150, 200, 180]
  ])(
    'calibrates terrain north when pointer drags across the dial to (%i, %i) as %i degrees',
    (clientX, clientY, expectedAngle) => {
      const onNorthAngleChange = vi.fn();
      render(
        <BedCompassHud
          northAngle={0}
          bedAzimuth={null}
          mode="position"
          onNorthAngleChange={onNorthAngleChange}
        />
      );
      const dial = screen.getByRole('spinbutton');
      vi.spyOn(dial, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        right: 200,
        bottom: 200,
        x: 100,
        y: 100,
        toJSON: () => {}
      });

      fireEvent.pointerDown(dial, { clientX: 150, clientY: 150, button: 0 });
      fireEvent.pointerMove(dial, { clientX, clientY });

      expect(onNorthAngleChange).toHaveBeenCalledWith(expectedAngle);
    }
  );

  it('snaps pointer rotation to 15 degree increments when shift key is active', () => {
    const onNorthAngleChange = vi.fn();
    render(
      <BedCompassHud
        northAngle={0}
        bedAzimuth={null}
        mode="position"
        onNorthAngleChange={onNorthAngleChange}
      />
    );
    const dial = screen.getByRole('spinbutton');
    vi.spyOn(dial, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    });

    fireEvent.pointerDown(dial, { clientX: 150, clientY: 150, button: 0 });
    fireEvent.pointerMove(dial, {
      clientX: 100,
      clientY: 110,
      shiftKey: true
    });

    expect(onNorthAngleChange).toHaveBeenCalledWith(315);
  });

  it('rotates selected bed on pointer drag', () => {
    const onBedRotationChange = vi.fn();
    render(
      <BedCompassHud
        northAngle={0}
        bedAzimuth={45}
        mode="position"
        onBedRotationChange={onBedRotationChange}
      />
    );
    const dial = screen.getByRole('spinbutton');
    vi.spyOn(dial, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    fireEvent.pointerDown(dial, { clientX: 50, clientY: 50, button: 0 });
    fireEvent.pointerMove(dial, { clientX: 50, clientY: 0 });

    expect(onBedRotationChange).toHaveBeenCalledWith(0);
  });

  it('stops updating angle on pointer move after pointer up', () => {
    const onNorthAngleChange = vi.fn();
    render(
      <BedCompassHud
        northAngle={0}
        bedAzimuth={null}
        mode="position"
        onNorthAngleChange={onNorthAngleChange}
      />
    );
    const dial = screen.getByRole('spinbutton');
    vi.spyOn(dial, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      right: 200,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON: () => {}
    });

    fireEvent.pointerDown(dial, { clientX: 150, clientY: 150, button: 0 });
    fireEvent.pointerUp(dial, { clientX: 150, clientY: 150 });
    fireEvent.pointerMove(dial, { clientX: 200, clientY: 150 });

    expect(onNorthAngleChange).not.toHaveBeenCalled();
  });
});
