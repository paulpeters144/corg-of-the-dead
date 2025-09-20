import * as PIXI from 'pixi.js';
import { OdaEntity } from '../../entity/entity.oda';
import { ZombieOneEntity } from '../../entity/entity.zombie-one';
import type { IDiContainer } from '../../util/di-container';
import type { ISystem } from '../system.agg';

const handleZombieSwipe = (props: { zombie: ZombieOneEntity; di: IDiContainer; now: number }) => {
  const { zombie, di, now } = props;
  if (now - zombie.lastSwipeHit > 500) {
    zombie.lastSwipeHit = now;
    const hitRect = zombie.rect;
    hitRect.width = 10;
    hitRect.height = 10;
    hitRect.y += 25;
    if (zombie.isFacingRight) {
      hitRect.x = zombie.rect.right - 10;
    } else {
      hitRect.x += 3;
    }

    di.eventBus().fire('zombieDidDamage', {
      rect: hitRect,
      hitFromDirection: zombie.isFacingRight ? 'right' : 'left',
      damage: 12,
    });
  }
};

const getNextZombiePos = (props: { zombie: ZombieOneEntity; delta: number }) => {
  const { zombie, delta } = props;

  if (!zombie.pathData.nextPos) return undefined;
  const { nextPos } = zombie.pathData;
  const result = new PIXI.Point(zombie.ctr.x, zombie.ctr.y);
  const moveSpeed = 7.5;
  if (nextPos.x > result.x) {
    result.x += moveSpeed * delta;
    if (result.x > nextPos.x) {
      result.x = nextPos.x;
    }
  }
  if (nextPos.x < result.x) {
    result.x -= moveSpeed * delta;
    if (result.x < nextPos.x) {
      result.x = nextPos.x;
    }
  }

  if (nextPos.y > result.y) {
    result.y += moveSpeed * delta;
    if (result.y > nextPos.y) {
      result.y = nextPos.y;
    }
  }
  if (nextPos.y < result.y) {
    result.y -= moveSpeed * delta;
    if (result.y < nextPos.y) {
      result.y = nextPos.y;
    }
  }

  if (result.x === nextPos.x && result.y === nextPos.y) {
    zombie.pathData.nextPos = undefined;
  }

  return result;
};

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
      for (const zombie of zombieList) {
        if (!zombie.anim.playing) zombie.setAnimation('idle');
        if (zombie.isActiveAnim('swipe') && zombie.anim.currentFrame === 2) {
          handleZombieSwipe({ zombie, di, now });
        }
        if (!zombie.isActiveAnim('idle', 'walk')) continue;
        if (!zombie.pathData.nextPos) {
          // if there is a zombie already at the oda's rect

          const nextPos = zombie.pathData.getNextPos({
            currRect: zombie.rect,
            targRect: oda.rect,
          });

          if (nextPos) {
            zombie.pathData.nextPos = new PIXI.Point(nextPos.x, nextPos.y);
          }

          if (!zombie.pathData.nextPos && zombie.isActiveAnim('walk')) {
            zombie.setAnimation('idle');
          }
          if (zombie.center.x > oda.center.x) zombie.faceLeft();
          if (zombie.center.x < oda.center.x) zombie.faceRight();
        }
        if (zombie.pathData.nextPos) {
          const pos = getNextZombiePos({ zombie, delta });
          if (pos) {
            zombie.ctr.position.set(pos.x, pos.y);
            if (zombie.isActiveAnim('idle')) zombie.setAnimation('walk');
          }
        }

        if (zombie.pathData.isClose) {
          zombie.setAnimation('swipe');
        }
      }
    },
  };
};
