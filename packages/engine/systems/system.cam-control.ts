import { CameraOrbEntity } from '../entity/entity.camera-orb';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

interface CamShakeEvent {
  duration?: number;
  magnitude?: number;
  frequency?: number;
}

export const createCamControlSystem = (di: IDiContainer): ISystem => {
  const camera = di.camera();
  const bus = di.eventBus();
  const entityStore = di.entityStore();
  const orb = entityStore.first(CameraOrbEntity);

  if (!orb) throw new Error('need cam orb');

  let shaking = false;
  let elapsed = 0;
  let duration = 0;
  let magnitude = 0;

  bus.on('camShake', (e: CamShakeEvent) => {
    shaking = true;
    elapsed = 0;
    duration = e.duration ?? 500;
    magnitude = e.magnitude ?? 10;
  });

  return {
    name: () => 'cam-shake-system',
    update: (delta: number) => {
      delta *= 100;

      if (!shaking) {
        camera.follow(orb.ctr, {
          speed: 5,
          acceleration: 50,
          radius: 0,
        });
        return;
      }

      elapsed += delta;

      if (elapsed >= duration) {
        shaking = false;

        // Restore original clamp bounds
        camera.clamp({
          left: 0,
          top: 0,
          right: 2600,
          bottom: 448,
        });

        // Resume normal following without any offset
        camera.follow(orb.ctr, {
          speed: 5,
          acceleration: 50,
          radius: 0,
        });
        return;
      }

      // Calculate shake offset
      const progress = elapsed / duration;
      const decay = 1 - progress;
      const offsetX = (Math.random() * 2 - 1) * magnitude * decay;
      const offsetY = (Math.random() * 2 - 1) * magnitude * decay;

      // Get the orb's current position (where camera should be following)
      const targetPos = orb.ctr;

      // Option 3: Expand clamp bounds temporarily during shake
      const originalClamp = { left: 0, top: 0, right: 2600, bottom: 448 };
      const shakeRadius = (magnitude * 0.5) * decay;

      // Expand clamp bounds by shake magnitude
      camera.clamp({
        left: originalClamp.left - shakeRadius,
        top: originalClamp.top - shakeRadius,
        right: originalClamp.right + shakeRadius,
        bottom: originalClamp.bottom + shakeRadius,
      });

      // Apply shake offset
      camera.animate({
        position: {
          x: targetPos.x + offsetX,
          y: targetPos.y + offsetY,
        },
        time: 1,
      });
    },
  };
};
