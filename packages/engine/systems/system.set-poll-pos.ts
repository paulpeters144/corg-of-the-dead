import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createSetPollPosSystem = (di: IDiContainer): ISystem => {
  const oda = di.entityStore().first(OdaEntity);
  if (!oda) throw new Error('create cam orb with no oda entity');

  return {
    name: () => 'set-poll-pos-system',
    update: (_: number) => {
      if (!oda.usingPoll) return;

      const facingRight = oda.isFacingRight;


      switch (oda.activeAnimation) {
        case 'pollIdle':
          if (oda.poll.anim.currentFrame !== 0) {
            oda.poll.anim.currentFrame = 0;
          }
          oda.poll.anim.y = oda.ctr.y - 18;
          if (!oda.poll.anim.visible) {
            oda.poll.anim.visible = true;
          }
          switch (oda.anim.currentFrame) {
            case 0:
              oda.poll.anim.x = oda.ctr.x + (facingRight ? -6 : 42);
              break;
            case 1:
              oda.poll.anim.x = oda.ctr.x + (facingRight ? -7 : 43);
              break;
            case 2:
              oda.poll.anim.x = oda.ctr.x + (facingRight ? -6 : 42);
              break;
            case 3:
              oda.poll.anim.x = oda.ctr.x + (facingRight ? -5 : 41);
              break;
            case 4:
              oda.poll.anim.x = oda.ctr.x + (facingRight ? -6 : 42);
              break;
            case 5:
              oda.poll.anim.x = oda.ctr.x + (facingRight ? -7 : 43);
              break;
            case 6:
              oda.poll.anim.x = oda.ctr.x + (facingRight ? -6 : 42);
              break;
            case 7:
              oda.poll.anim.x = oda.ctr.x + (facingRight ? -5 : 41);
              break;
          }
          break;

        case 'pollRun':
          if (oda.poll.anim.currentFrame !== 0) {
            oda.poll.anim.currentFrame = 0;
          }
          oda.poll.anim.x = oda.ctr.x + (facingRight ? -7 : 42);
          if (!oda.poll.anim.visible) {
            oda.poll.anim.visible = true;
          }
          switch (oda.anim.currentFrame) {
            case 0:
              oda.poll.anim.y = oda.ctr.y + -16;
              break;
            case 1:
              oda.poll.anim.y = oda.ctr.y + -15;
              break;
            case 2:
              oda.poll.anim.y = oda.ctr.y + -14;
              break;
            case 3:
              oda.poll.anim.y = oda.ctr.y + -15;
              break;
            case 4:
              oda.poll.anim.y = oda.ctr.y + -16;
              break;
            case 5:
              oda.poll.anim.y = oda.ctr.y + -15;
              break;
            case 6:
              oda.poll.anim.y = oda.ctr.y + -14;
              break;
            case 7:
              oda.poll.anim.y = oda.ctr.y + -15;
              break;
          }
          break;
        case 'pollSwing':
          switch (oda.anim.currentFrame) {
            case 0:
              if (oda.isFacingRight) {
                oda.poll.anim.currentFrame = 1;
                oda.poll.anim.x = oda.ctr.x - 2;
                oda.poll.anim.y = oda.ctr.y - 19;
                oda.poll.anim.zIndex = oda.ctr.zIndex - 1;
                oda.poll.anim.visible = true;
              } else {
                oda.poll.anim.currentFrame = 1;
                oda.poll.anim.x = oda.ctr.x + 37;
                oda.poll.anim.y = oda.ctr.y - 18;
                oda.poll.anim.zIndex = oda.ctr.zIndex - 1;
                oda.poll.anim.visible = true;
              }
              break;
            case 1:
              if (oda.isFacingRight) {
                oda.poll.anim.currentFrame = 3;
                oda.poll.anim.y = oda.ctr.y + 6;
                oda.poll.anim.x = oda.ctr.x + 41;
                oda.poll.anim.zIndex = oda.ctr.zIndex - 1;
                oda.poll.anim.visible = true;
              } else {
                oda.poll.anim.currentFrame = 3;
                oda.poll.anim.y = oda.ctr.y + 5;
                oda.poll.anim.x = oda.ctr.x - 6;
                oda.poll.anim.zIndex = oda.ctr.zIndex - 1;
                oda.poll.anim.visible = true;
              }
              break;
            case 2:
              oda.poll.anim.currentFrame = 0;
              oda.poll.anim.visible = false;
              break;
          }
          break;
      }
    },
  };
};
