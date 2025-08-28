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
  let originalPos = { x: 0, y: 0 };

  bus.on('camShake', (e: CamShakeEvent) => {
    shaking = true;
    elapsed = 0;
    duration = e.duration ?? 500;
    magnitude = e.magnitude ?? 10;

    originalPos = camera.centerPos();
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
        camera.animate({
          position: originalPos,
          time: 0,
        });
        return;
      }

      const progress = elapsed / duration;
      const decay = 1 - progress;

      const offsetX = (Math.random() * 2 - 1) * magnitude * decay;
      const offsetY = (Math.random() * 2 - 1) * magnitude * decay;

      camera.animate({
        position: {
          x: originalPos.x + offsetX,
          y: originalPos.y + offsetY,
        },
        time: 1,
      });
    },
  };
};
