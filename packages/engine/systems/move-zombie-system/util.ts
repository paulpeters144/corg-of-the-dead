import * as PIXI from 'pixi.js';
import type { Entity } from '../../entity/entity';
import type { ZombieOneEntity } from '../../entity/entity.zombie-one';
import type { IDiContainer } from '../../util/di-container';
import { randNum } from '../../util/util';

export const createGraphic = (rect: PIXI.Rectangle, color?: string) => {
  color = color ? color : 'green';
  return new PIXI.Graphics().rect(rect.x, rect.y, rect.width, rect.height).fill({ color });
};

export const getAttackSquares = (entity: Entity) => {
  const { x, y, width: w, height: h } = entity.moveRect;
  const buffer = 10;
  const top = new PIXI.Rectangle(x, y - h - buffer, w, h);
  const right = new PIXI.Rectangle(x + w + buffer, y, w, h);
  const down = new PIXI.Rectangle(x, y + h + buffer, w, h);
  const left = new PIXI.Rectangle(x - w - buffer, y, w, h);

  return { top, right, down, left };
};

export const getNextTargetPos = (data: { zombie: ZombieOneEntity; target: Entity; now: number }) => {
  const { zombie, target, now } = data;
  const curPos = zombie.moveRect;
  const maxDistance = 100;

  if (now - zombie.pathData.lastTimeSet < zombie.pathData.walkInterval) {
    return undefined;
  }

  zombie.pathData.lastTimeSet = now;
  zombie.pathData.walkInterval = randNum(500, 2000);

  const { top: topRect, right: rightRect, down: downRect, left: leftRect } = getAttackSquares(target);
  const attackPositions = [
    { x: topRect.x, y: topRect.y },
    { x: rightRect.x, y: rightRect.y },
    { x: downRect.x, y: downRect.y },
    { x: leftRect.x, y: leftRect.y },
  ];

  let result: { x: number; y: number } | null = null;
  let bestDistance = Infinity;

  for (const p of attackPositions) {
    const dist = distanceBetween({ p1: p, p2: curPos });
    if (dist < bestDistance) {
      result = p;
      bestDistance = dist;
    }
  }

  if (!result) {
    return new PIXI.Point(curPos.x, curPos.y);
  }

  if (bestDistance > maxDistance) {
    const dx = result.x - curPos.x;
    const scale = maxDistance / bestDistance;
    return new PIXI.Point(curPos.x + dx * scale, curPos.y);
  }

  return new PIXI.Point(result.x, result.y);
};

export const handleZombieSwipe = (props: { zombie: ZombieOneEntity; di: IDiContainer; now: number }) => {
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

export const isAttacking = (zombie: ZombieOneEntity) => {
  if (!zombie.isActiveAnim('swipe')) return false;
  if (zombie.anim.currentFrame !== 2) return false;
  return true;
};

export const intersects = (entityMoveRect: PIXI.Rectangle, list: Entity[]) => {
  for (let i = 0; i < list.length; i++) {
    if (entityMoveRect.intersects(list[i].moveRect)) {
      return true;
    }
  }
  return false;
};

export const distanceBetween = (data: { p1: { x: number; y: number }; p2: { x: number; y: number } }) => {
  // Distance formula:
  //        _________________________
  // d = \_/((x2 - x1)² + (y2 - y1)²)
  const dx = data.p1.x - data.p2.x;
  const dy = data.p1.y - data.p2.y;
  // can remove the sqrt if we need better performance
  return Math.sqrt(dx * dx + dy * dy);
};

export const getNextMoveAmount = (props: { zombie: ZombieOneEntity; delta: number }) => {
  const { zombie, delta } = props;
  const { pathData } = zombie;
  if (!pathData.nextPos) return undefined;

  const { nextPos } = pathData;
  const moveSpeed = 6.5;
  const curRect = zombie.moveRect;
  const curPos = new PIXI.Point(curRect.x, curRect.y);
  const result = new PIXI.Point(0, 0);

  if (curPos.x > nextPos.x) {
    const toMove = -moveSpeed * delta;
    if (Math.abs(curPos.x - nextPos.x) < -toMove) {
      result.x = nextPos.x - curPos.x;
    } else {
      result.x = toMove;
    }
  }
  if (curPos.x < nextPos.x) {
    const toMove = moveSpeed * delta;
    if (Math.abs(curPos.x - nextPos.x) < toMove) {
      result.x = nextPos.x - curPos.x;
    } else {
      result.x = toMove;
    }
  }

  if (result.x === 0) {
    if (curPos.y > nextPos.y) {
      const toMove = -moveSpeed * delta;
      if (Math.abs(curPos.y - nextPos.y) < -toMove) {
        result.y = nextPos.y - curPos.y;
      } else {
        result.y = toMove;
      }
    }
    if (curPos.y < nextPos.y) {
      const toMove = moveSpeed * delta;
      if (Math.abs(curPos.y - nextPos.y) < toMove) {
        result.y = nextPos.y - curPos.y;
      } else {
        result.y = toMove;
      }
    }
  }

  if (Math.abs(result.x) < 0.0001 && Math.abs(result.y) < 0.0001) {
    return undefined;
  }

  return result;
};
