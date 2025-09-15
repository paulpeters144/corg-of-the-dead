import * as PIXI from 'pixi.js';
import { OdaEntity } from '../entity/entity.oda';
import { ZombieOneEntity } from '../entity/entity.zombie-one';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

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

    // const g = new PIXI.Graphics()
    //   .rect(zRect.x, zRect.y, zRect.width, zRect.height)
    //   .fill({ color: 'red' })
    // g.zIndex = 999;
    // di.gameRef().addChild(g);
    // setTimeout(() => { di.gameRef().removeChild(g) }, 150)

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
  const moveSpeed = 10;
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
      for (const zombie of entityStore.getAll(ZombieOneEntity)) {
        if (!zombie.anim.playing) zombie.setAnimation('idle');
        if (zombie.isActiveAnim('swipe') && zombie.anim.currentFrame === 2) {
          handleZombieSwipe({ zombie, di, now });
        }
        if (!zombie.isActiveAnim('idle', 'walk')) continue;
        if (!zombie.pathData.nextPos) {
          zombie.pathData.setNextPos({
            currRect: zombie.rect,
            targRect: oda.rect,
          });

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
