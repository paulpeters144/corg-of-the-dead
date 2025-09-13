import * as PIXI from 'pixi.js';
import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';
import { ZombieOneEntity } from '../entity/entity.zombie-one';

export const createSwingPollSystem = (di: IDiContainer): ISystem => {
  const input = di.input();
  const entityStore = di.entityStore();
  const bus = di.eventBus();
  const oda = entityStore.first(OdaEntity);
  if (!oda) throw new Error('oda not found');
  let lastSwing = performance.now();
  let registeredSwing = false;
  return {
    name: () => 'swing-poll-system',
    update: (_: number) => {
      if (!oda.usingPoll) return;

      const now = performance.now();

      if (input.shoot.is.pressed && !oda.isActiveAnim('pollSwing') && now - lastSwing > 500) {
        oda.setPollSwing();
        setTimeout(() => {
          oda.setIdlePoll();
          registeredSwing = false;
        }, 350);
        lastSwing = performance.now();
      }

      if (oda.isActiveAnim('pollSwing') && oda.poll.anim.currentFrame === 3 && !registeredSwing) {
        const rect = new PIXI.Rectangle(
          oda.poll.anim.x - 2,
          oda.poll.anim.y + 18,
          oda.poll.anim.width,
          oda.poll.anim.height - 30
        );

        entityStore.getAll(ZombieOneEntity)
          .filter(z => {
            const r = z.rect;
            r.x += oda.isFacingRight ? 15 : 45;
            r.y += 12;
            r.width -= 30;
            r.height -= 18
            return r.intersects(rect) &&
              z.isActiveAnim('idle', 'walk', 'swipe') &&
              z.health > 0;
          })
          .forEach(z => {
            bus.fire('zombiePollHit', {
              id: z.id,
              direction: oda.isFacingRight ? "right" : "left",
              damage: oda.poll.damage,
            })
            bus.fire('camShake', {
              duration: 40,
              magnitude: 4,
            })
          })

        registeredSwing = true;
      }
    },
  };
};
