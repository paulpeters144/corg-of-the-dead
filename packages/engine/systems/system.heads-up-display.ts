import { HeadsUpDisplayEntity } from '../entity/entity.hud';
import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createHeadsUpDisplaySystem = (di: IDiContainer): ISystem => {
  const input = di.input();
  const bus = di.eventBus();
  const entityStore = di.entityStore();
  const hud = entityStore.first(HeadsUpDisplayEntity);

  if (!hud) throw new Error('hud entity not found');
  const camera = di.camera();

  setTimeout(() => {
    hud.setHeathPercent(30);
  }, 1000);

  bus.on('odaShot', (e) => {
    hud.setGunText(`${e.ammo}`);
  });

  return {
    name: () => 'hud-system',
    update: (_: number) => {
      const camZeroPos = camera.zeroPos();
      hud.ctr.position.set(camZeroPos.x + 10, camZeroPos.y + 5);
      if (input.option.is.pressed) {
        const odasGun = entityStore.first(OdaEntity)?.gun;
        if (odasGun) {
          hud.setGunText(`${odasGun.ammo} ${odasGun.name}`);
        }
      }
      if (input.option.wasReleasedOnce) {
        const odasGun = entityStore.first(OdaEntity)?.gun;
        if (odasGun) {
          hud.setGunText(`${odasGun.ammo}`);
        }
      }
    },
  };
};
