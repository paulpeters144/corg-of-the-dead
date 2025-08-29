import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createSetPlayerGunPosSystem = (di: IDiContainer): ISystem => {
  const oda = di.entityStore().first(OdaEntity);
  if (!oda) throw new Error('create cam orb with no oda entity');

  // The commented out code below appears to be for initial setup, so I've left it as-is.
  // setTimeout(() => {
  //  oda.faceLeft()
  //  oda.setIdle();
  //  oda.anim.gotoAndStop(0)
  //  oda.anim.loop = true
  // }, 200)

  return {
    name: () => 'set-player-gun-pos-system',
    update: (_: number) => {
      if (!oda.gun) return;

      const facingRight = oda.isFacingRight;

      switch (oda.activeAnimation) {
        case 'idle':
          oda.gun.sprite.y = oda.ctr.y + 17;
          switch (oda.anim.currentFrame) {
            case 0:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 22 : 18);
              break;
            case 1:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 21 : 19);
              break;
            case 2:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 22 : 18);
              break;
            case 3:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 23 : 17);
              break;
            case 4:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 22 : 18);
              break;
            case 5:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 21 : 19);
              break;
            case 6:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 22 : 18);
              break;
            case 7:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 23 : 17);
              break;
          }
          break;

        case 'running':
          oda.gun.sprite.y = oda.ctr.y + 17;
          switch (oda.anim.currentFrame) {
            case 0:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 19 : 23);
              break;
            case 1:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 19 : 23);
              break;
            case 2:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 19 : 23);
              break;
            case 3:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 19 : 23);
              break;
            case 4:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 19 : 23);
              break;
            case 5:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 18 : 22);
              break;
            case 6:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 18 : 22);
              break;
            case 7:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 18 : 22);
              break;
          }
          break;

        case 'shoot':
          oda.gun.sprite.y = oda.ctr.y + 17;
          switch (oda.anim.currentFrame) {
            case 0:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 20 : 20);
              break;
            case 1:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 21 : 19);
              break;
            case 2:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 22 : 18);
              break;
          }
          break;

        case 'walk':
          oda.gun.sprite.y = oda.ctr.y + 17;
          switch (oda.anim.currentFrame) {
            case 0:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 20 : 20);
              break;
            case 1:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 20 : 20);
              break;
            case 2:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 20 : 20);
              break;
            case 3:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 20 : 20);
              break;
            case 4:
              oda.gun.sprite.x = oda.ctr.x + (facingRight ? 20 : 20);
              break;
          }
          break;
      }
    },
  };
};
