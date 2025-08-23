import type { IInput } from './input.control';

export const adaptToWeb = (input: IInput) => {
  if (typeof window === 'undefined') {
    throw new Error('cannot adapt to the web without a window');
  }
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Enter':
        input.start.press();
        break;
      case 'ArrowUp':
        input.up.press();
        break;
      case 'ArrowRight':
        input.right.press();
        break;
      case 'ArrowDown':
        input.down.press();
        break;
      case 'ArrowLeft':
        input.left.press();
        break;
      case 'Escape':
        //
        break;
      case 'z':
        input.jump.press();
        break;
      case 'x':
        input.run.press();
        break;
      case 'c':
        input.shoot.press();
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'Enter':
        input.start.release();
        break;
      case 'ArrowUp':
        input.up.release();
        break;
      case 'ArrowRight':
        input.right.release();
        break;
      case 'ArrowDown':
        input.down.release();
        break;
      case 'ArrowLeft':
        input.left.release();
        break;
      case 'Escape':
        //
        break;
      case 'z':
        input.jump.release();
        break;
      case 'x':
        input.run.release();
        break;
      case 'c':
        input.shoot.release();
        break;
    }
  });
};
