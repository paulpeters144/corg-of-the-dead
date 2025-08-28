import { HeadsUpDisplayEntity } from '../entity/entity.hud';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createHeadsUpDisplaySystem = (di: IDiContainer): ISystem => {
  const bus = di.eventBus();
  const hud = di.entityStore().first(HeadsUpDisplayEntity);
  if (!hud) throw new Error('hud entity not found');
  const camera = di.camera();

  setTimeout(() => {
    hud.setHeathPercent(30);
  }, 1000);

  bus.on('odaShot', (e) => {
    hud.setAmmo(e.ammo);
  });

  return {
    name: () => 'hud-system',
    update: (_: number) => {
      const camZeroPos = camera.zeroPos();
      hud.ctr.position.set(camZeroPos.x + 10, camZeroPos.y + 5);
    },
  };
};
