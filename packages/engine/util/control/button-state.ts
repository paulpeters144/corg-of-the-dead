/**
 * Represents the full state of a single input button/key.
 * Tracks press/release timing, "pressed once" / "released once" semantics,
 * and allows querying whether a button is held for a given duration.
 */
export interface IBtnState {
  /**
   * Marks the button as pressed.
   * Updates `lastPress`, sets `is.pressed = true`, and resets release flags.
   */
  press: () => void;

  /**
   * Marks the button as released.
   * Updates `lastRelease`, sets `is.released = true`, and resets press flags.
   */
  release: () => void;

  /**
   * Timestamp (in ms since performance epoch) of the most recent press event.
   */
  lastPress: number;

  /**
   * Timestamp (in ms since performance epoch) of the most recent release event.
   */
  lastRelease: number;

  /**
   * Returns `true` only once immediately after the button transitions
   * from released → pressed.
   *
   * Subsequent calls reset this flag until the next press event occurs.
   */
  wasPressedOnce: boolean;

  /**
   * Returns `true` only once immediately after the button transitions
   * from pressed → released.
   *
   * Subsequent calls reset this flag until the next release event occurs.
   */
  wasReleasedOnce: boolean;

  /**
   * Current "is" state of the button.
   * - `pressed`: true if button is currently held down.
   * - `released`: true if button is currently released.
   */
  is: {
    pressed: boolean;
    released: boolean;
  };

  /**
   * Checks if the button has been continuously pressed for at least `ms` milliseconds.
   *
   * @param ms - Milliseconds threshold.
   * @returns true if the button is pressed and the press duration exceeds `ms`.
   */
  pressHeldAfter: (ms: number) => boolean;
}

class BtnState implements IBtnState {
  private on = false;
  private onOnce = false;
  private off = false;
  private offOnce = false;
  private lastReleaseMs = 0;
  private lastPressMs = 0;

  public press = () => {
    this.on = true;
    this.onOnce = true;
    this.offOnce = false;
    this.off = false;
    this.lastPressMs = performance.now();
  };

  public release = () => {
    this.on = false;
    this.onOnce = false;
    this.offOnce = true;
    this.off = true;
    this.lastReleaseMs = performance.now();
  };

  public get lastPress() {
    return this.lastPressMs;
  }

  public get lastRelease() {
    return this.lastReleaseMs;
  }

  public get wasPressedOnce() {
    if (this.onOnce) {
      this.onOnce = false;
      this.on = true;
      this.lastPressMs = performance.now();
      return true;
    }
    return false;
  }

  public get wasReleasedOnce() {
    if (this.offOnce) {
      this.offOnce = false;
      this.lastReleaseMs = performance.now();
      return true;
    }
    return false;
  }

  public get is() {
    return {
      pressed: this.on,
      released: this.off,
    };
  }

  public pressHeldAfter = (ms: number): boolean => {
    if (!this.on) return false;
    const now = performance.now();
    const diff = now - this.lastPress;
    return diff > ms;
  };
}

export const createButtonState = (): IBtnState => {
  return new BtnState();
};
