
import { OdaEntity } from "../entity/entity.oda";
import type { IDiContainer } from "../util/di-container";
import type { ISystem } from "./system.agg";

export const createSetPlayerGunPosSystem = (di: IDiContainer): ISystem => {
  const oda = di.entityStore().first(OdaEntity);
  if (!oda) throw new Error('create cam orb with no oda entity')
  // setTimeout(() => {
  //   oda.faceLeft()
  //   oda.setIdle();
  //   oda.anim.gotoAndStop(0)
  //   oda.anim.loop = true
  // }, 200)
  return {
    name: () => 'set-player-gun-pos-system',
    update: (_: number) => {
      if (!oda.gun) return;

      const facingRight = oda.isFacingRight

      switch (oda.activeAnimation) {
        case 'idle':

          oda.gun.sprite.y = oda.ctr.y + 17;
          switch (oda.anim.currentFrame) {
            case 0:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 22 :
                oda.gun.sprite.x = oda.ctr.x + 18;
              break;
            case 1:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 21 :
                oda.gun.sprite.x = oda.ctr.x + 19;
              break;
            case 2:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 22 :
                oda.gun.sprite.x = oda.ctr.x + 18;
              break;
            case 3:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 23 :
                oda.gun.sprite.x = oda.ctr.x + 17;
              break;
            case 4:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 22 :
                oda.gun.sprite.x = oda.ctr.x + 18;
              break;
            case 5:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 21 :
                oda.gun.sprite.x = oda.ctr.x + 19;
              break;
            case 6:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 22 :
                oda.gun.sprite.x = oda.ctr.x + 18;
              break;
            case 7:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 23 :
                oda.gun.sprite.x = oda.ctr.x + 17;
              break;
          }
          break

        case 'running':
          oda.gun.sprite.y = oda.ctr.y + 17;
          switch (oda.anim.currentFrame) {
            case 0:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 19 :
                oda.gun.sprite.x = oda.ctr.x + 23;
              break;
            case 1:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 19 :
                oda.gun.sprite.x = oda.ctr.x + 23;
              break;
            case 2:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 19 :
                oda.gun.sprite.x = oda.ctr.x + 23;
              break;
            case 3:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 19 :
                oda.gun.sprite.x = oda.ctr.x + 23;
              break;
            case 4:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 19 :
                oda.gun.sprite.x = oda.ctr.x + 23;
              break;
            case 5:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 18 :
                oda.gun.sprite.x = oda.ctr.x + 22;
              break;
            case 6:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 18 :
                oda.gun.sprite.x = oda.ctr.x + 22;
              break;
            case 7:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 18 :
                oda.gun.sprite.x = oda.ctr.x + 22;
              break;
          }
          break

        case 'shoot':

          oda.gun.sprite.y = oda.ctr.y + 17;
          switch (oda.anim.currentFrame) {
            case 0:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 20 :
                oda.gun.sprite.x = oda.ctr.x + 20;
              break;
            case 1:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 21 :
                oda.gun.sprite.x = oda.ctr.x + 19;
              break;
            case 2:
              facingRight ?
                oda.gun.sprite.x = oda.ctr.x + 22 :
                oda.gun.sprite.x = oda.ctr.x + 18;
              break;
          }
          break
      }
    }
  }
}
