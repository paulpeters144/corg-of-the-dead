import * as PIXI from 'pixi.js';
import type { Entity } from '../../entity/entity';
import { OdaEntity } from '../../entity/entity.oda';
import { TrafficDrumEntity } from '../../entity/entity.traffic-drum';
import { ZombieOneEntity } from '../../entity/entity.zombie-one';
import type { IDiContainer } from '../../util/di-container';
import type { ISystem } from '../system.agg';
import * as util from './util';

// attack oda when they are close enough;

export const createZombieMoveSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  const oda = entityStore.first(OdaEntity);
  if (!oda) throw new Error('oda not found');

  return {
    name: () => 'zombie-move-system',
    update: (delta: number) => {
      const now = performance.now();
      if (now < 1500) return;
      const zombieList = entityStore.getAll(ZombieOneEntity);
      const entityList: Entity[] = [...zombieList, ...entityStore.getAll(TrafficDrumEntity)];

      for (const zombie of zombieList) {
        if (!zombie.anim.playing) zombie.setAnimation('idle');

        if (util.isAttacking(zombie)) util.handleZombieSwipe({ zombie, di, now });

        if (!zombie.isActiveAnim('idle', 'walk')) continue;

        if (!zombie.pathData.nextPos) {
          zombie.pathData.nextPos = util.getNextTargetPos({
            zombie: zombie,
            target: oda,
            now: now,
          });

          if (!zombie.pathData.nextPos && zombie.isActiveAnim('walk')) {
            zombie.setAnimation('idle');
          }
          if (zombie.center.x > oda.center.x) zombie.faceLeft();
          if (zombie.center.x < oda.center.x) zombie.faceRight();
        }

        if (zombie.pathData.nextPos) {
          const pos = util.getNextMoveAmount({ zombie, delta });
          if (pos) {
            const zMoveRect = zombie.moveRect;
            const nextMoveRect = new PIXI.Rectangle(
              zMoveRect.x + pos.x,
              zMoveRect.y + pos.y,
              zMoveRect.width,
              zMoveRect.height,
            );
            const isIntersecting = util.intersects(
              zMoveRect,
              entityList.filter((e) => e.id !== zombie.id),
            );
            const willIntersect = util.intersects(
              nextMoveRect,
              entityList.filter((e) => e.id !== zombie.id),
            );

            if (isIntersecting || !willIntersect) {
              zombie.ctr.x += pos.x;
              zombie.ctr.y += pos.y;
            } else {
              zombie.pathData.nextPos = undefined;
            }
            if (zombie.isActiveAnim('idle')) zombie.setAnimation('walk');
          } else {
            zombie.pathData.nextPos = undefined;
          }
        }

        const distance = util.distanceBetween({ p1: zombie.moveRect, p2: oda.moveRect });
        if (distance < 31 && !zombie.isActiveAnim('swipe')) {
          zombie.setAnimation('swipe');
        }
      }
    },
  };
};
