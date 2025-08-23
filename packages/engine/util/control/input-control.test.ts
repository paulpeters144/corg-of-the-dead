import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createButtonState } from './button-state.ts';
import { createInputController } from './input.control.ts';

let now = 1000;
beforeEach(() => {
  now = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
});

describe('BtnState', () => {
  it('should start with default values', () => {
    const btn = createButtonState();

    expect(btn.is.pressed).toBe(false);
    expect(btn.is.released).toBe(false);
    expect(btn.wasPressedOnce).toBe(false);
    expect(btn.wasReleasedOnce).toBe(false);
    expect(btn.lastPress).toBe(0);
    expect(btn.lastRelease).toBe(0);
  });

  it('should update state when pressed', () => {
    const btn = createButtonState();

    btn.press();

    expect(btn.is.pressed).toBe(true);
    expect(btn.is.released).toBe(false);
    expect(btn.lastPress).toBe(1000);
  });

  it('should set wasPressedOnce only once per press', () => {
    const btn = createButtonState();

    btn.press();
    expect(btn.wasPressedOnce).toBe(true);
    expect(btn.wasPressedOnce).toBe(false); // flag resets after first read
  });

  it('should update state when released', () => {
    const btn = createButtonState();

    btn.press();
    btn.release();

    expect(btn.is.pressed).toBe(false);
    expect(btn.is.released).toBe(true);
    expect(btn.lastRelease).toBe(1000);
  });

  it('should set wasReleasedOnce only once per release', () => {
    const btn = createButtonState();

    btn.press();
    btn.release();
    expect(btn.wasReleasedOnce).toBe(true);
    expect(btn.wasReleasedOnce).toBe(false); // flag resets after first read
  });

  it('should detect pressHeldAfter correctly', () => {
    const btn = createButtonState();

    btn.press();
    expect(btn.pressHeldAfter(100)).toBe(false);

    // advance time
    now += 200;
    expect(btn.pressHeldAfter(100)).toBe(true);
  });

  it('should return false for pressHeldAfter if not pressed', () => {
    const btn = createButtonState();

    expect(btn.pressHeldAfter(50)).toBe(false);
  });

  it('should update lastPress again on wasPressedOnce read', () => {
    const btn = createButtonState();

    btn.press();
    now += 50;
    const firstRead = btn.wasPressedOnce;
    expect(firstRead).toBe(true);
    expect(btn.lastPress).toBe(1050); // updated during read
  });

  it('should update lastRelease again on wasReleasedOnce read', () => {
    const btn = createButtonState();

    btn.press();
    btn.release();
    now += 75;
    const firstRead = btn.wasReleasedOnce;
    expect(firstRead).toBe(true);
    expect(btn.lastRelease).toBe(1075); // updated during read
  });
});

describe('createInputController', () => {
  it('should create an input controller with all expected keys', () => {
    const controller = createInputController();
    const keys = Object.keys(controller);

    expect(keys).toEqual(['up', 'right', 'down', 'left', 'run', 'shoot', 'jump', 'start', 'select']);
  });

  it('should create independent button states for each input', () => {
    const controller = createInputController();

    controller.up.press();
    expect(controller.up.is.pressed).toBe(true);
    expect(controller.right.is.pressed).toBe(false);
  });

  it('should allow interaction with each button state', () => {
    const controller = createInputController();

    controller.jump.press();
    expect(controller.jump.wasPressedOnce).toBe(true);

    controller.jump.release();
    expect(controller.jump.wasReleasedOnce).toBe(true);
  });
});
