import { HeadsUpDisplayEntity } from '../entity/entity.hud';
import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createHeadsUpDisplaySystem = (di: IDiContainer): ISystem => {
  const camera = di.camera();
  const input = di.input();
  const bus = di.eventBus();
  const entityStore = di.entityStore();
  const hud = entityStore.first(HeadsUpDisplayEntity);
  const oda = entityStore.first(OdaEntity);

  if (!hud) throw new Error('hud entity not found');
  if (!oda) throw new Error('oda not found');

  setTimeout(() => {
    hud.setHeathPercent(65);
  }, 1000);

  bus.on('odaShot', (e) => {
    const gun = hud.gunInfo.gunList.find((g) => g.name === e.name);
    if (gun) {
      const idxOfGun = hud.gunInfo.gunList.indexOf(gun);
      const ammoText = hud.gunInfo.gunGraphics.at(idxOfGun)?.ammoText;
      if (ammoText) ammoText.text = e.ammo.toString();
    }
  });

  return {
    name: () => 'hud-system',
    update: (delta: number) => {
      const camZeroPos = camera.zeroPos();
      hud.ctr.position.set(camZeroPos.x + 10, camZeroPos.y + 5);
      if (input.option.is.pressed) {
        hud.showGunList();

        if (input.down.wasPressedOnce) {
          hud.gunInfo.hoverSelectNext();
        }
        if (input.up.wasPressedOnce) {
          hud.gunInfo.hoverSelectPrev();
        }
      }
      if (input.option.wasReleasedOnce) {
        const selectedGunName = hud.hideGunList();
        if (selectedGunName) {
          oda.setActiveWeapon({ type: 'gun', name: selectedGunName });
          hud.gunInfo.setNewGunList(oda.gunList);
          const activeGun = oda.gunList.find((g) => g.name === selectedGunName);
          const nonAcivtGuns = oda.gunList.filter((g) => g.name !== selectedGunName);
          if (activeGun) {
            oda.gunList = [activeGun, ...nonAcivtGuns.sort()];
            hud.gunInfo.gunList = oda.gunList;
          }
        }
      }

      hud.update(delta);
    },
  };
};
