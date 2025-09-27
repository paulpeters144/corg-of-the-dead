import * as PIXI from 'pixi.js';
import { BoundaryBox } from '../entity/entity.boundary-box';
import { OdaEntity } from '../entity/entity.oda';
import { TrafficDrumEntity } from '../entity/entity.traffic-drum';
import { ZombieOneEntity } from '../entity/entity.zombie-one';
import type { IInput } from '../util/control/input.control';
import type { IDiContainer } from '../util/di-container';
import { byDistanceAsc, isCloseBy } from '../util/util';
import type { ISystem } from './system.agg';

const createRollMechanic = (input: IInput) => {
  let lastRoll = 0;

  let lastPressUp = 0;
  let lastPressRight = 0;
  let lastPressDown = 0;
  let lastPressLeft = 0;

  let prevPressedUp = false;
  let prevPressedRight = false;
  let prevPressedDown = false;
  let prevPressedLeft = false;

  const didRoll = (): 'up' | 'rt' | 'dn' | 'lt' | undefined => {
    if (!input.walk.is.pressed && !input.shoot.is.pressed) return undefined;

    const now = performance.now();
    if (now - lastRoll < 750) return;

    if (input.up.is.pressed && !prevPressedUp) {
      if (now - lastPressUp < 250) {
        lastRoll = now;
        lastPressUp = 0;
        prevPressedUp = true;
        return 'up';
      }
      lastPressUp = now;
    }
    prevPressedUp = input.up.is.pressed;

    if (input.right.is.pressed && !prevPressedRight) {
      if (now - lastPressRight < 250) {
        lastRoll = now;
        lastPressRight = 0;
        prevPressedRight = true;
        return 'rt';
      }
      lastPressRight = now;
    }
    prevPressedRight = input.right.is.pressed;

    if (input.down.is.pressed && !prevPressedDown) {
      if (now - lastPressDown < 250) {
        lastRoll = now;
        lastPressDown = 0;
        prevPressedDown = true;
        return 'dn';
      }
      lastPressDown = now;
    }
    prevPressedDown = input.down.is.pressed;

    if (input.left.is.pressed && !prevPressedLeft) {
      if (now - lastPressLeft < 250) {
        lastRoll = now;
        lastPressLeft = 0;
        prevPressedLeft = true;
        return 'lt';
      }
      lastPressLeft = now;
    }
    prevPressedLeft = input.left.is.pressed;

    return undefined;
  };

  return { didRoll };
};

export const collides = (rect1: PIXI.Rectangle) => {
  const topOf = (rect2: PIXI.Rectangle): boolean => {
    if (rect1.x + rect1.width < rect2.x) return false;
    if (rect1.x > rect2.x + rect2.width) return false;
    if (rect1.y + rect1.height < rect2.y) return false;
    if (rect1.y > rect2.y) return false;
    return true;
  };

  const bottomOf = (rect2: PIXI.Rectangle): boolean => {
    if (rect1.x + rect1.width < rect2.x) return false;
    if (rect1.x > rect2.x + rect2.width) return false;
    if (rect1.y > rect2.y + rect2.height) return false;
    if (rect1.y < rect2.y) return false;
    return true;
  };

  const leftOf = (rect2: PIXI.Rectangle): boolean => {
    if (rect1.y + rect1.height < rect2.y) return false;
    if (rect1.y > rect2.y + rect2.height) return false;
    if (rect1.x + rect1.width < rect2.x) return false;
    if (rect1.x > rect2.x) return false;
    return true;
  };

  const rightOf = (rect2: PIXI.Rectangle): boolean => {
    if (rect1.y + rect1.height < rect2.y) return false;
    if (rect1.y > rect2.y + rect2.height) return false;
    if (rect1.x > rect2.x + rect2.width) return false;
    if (rect1.x < rect2.x) return false;
    return true;
  };

  return { topOf, bottomOf, leftOf, rightOf };
};

interface IUpdatePosProps {
  entityRect: PIXI.Rectangle;
  collideArea: PIXI.Rectangle[];
  endPos: PIXI.Point;
  speed: number;
  delta: number;
}

export const getNextMoveAmount = (props: IUpdatePosProps): PIXI.Point | null => {
  const { entityRect, delta, collideArea, speed, endPos } = props;

  const currPos = entityRect.clone();
  const nextPos = entityRect.clone();

  const shouldMoveRight = entityRect.x < endPos.x;
  const shouldMoveLeft = entityRect.x > endPos.x;
  const shouldMoveUp = entityRect.y > endPos.y;
  const shouldMoveDown = entityRect.y < endPos.y;

  const xMoveAmount = speed * delta;
  const yMoveAmount = speed * delta * 0.75;

  if (shouldMoveRight) {
    nextPos.x = Math.min(entityRect.x + xMoveAmount, endPos.x);
  } else if (shouldMoveLeft) {
    nextPos.x = Math.max(entityRect.x - xMoveAmount, endPos.x);
  }

  for (const rect of collideArea.filter((c) => c.intersects(nextPos))) {
    const col = collides(nextPos);
    if (col.leftOf(rect)) nextPos.x = rect.x - nextPos.width;
    if (col.rightOf(rect)) nextPos.x = rect.x + rect.width;
  }

  if (shouldMoveDown) {
    nextPos.y = Math.min(entityRect.y + yMoveAmount, endPos.y);
  } else if (shouldMoveUp) {
    nextPos.y = Math.max(entityRect.y - yMoveAmount, endPos.y);
  }

  for (const rect of collideArea.filter((c) => c.intersects(nextPos))) {
    const col = collides(nextPos);
    if (col.topOf(rect)) nextPos.y = rect.y - nextPos.height;
    if (col.bottomOf(rect)) nextPos.y = rect.y + rect.height;
  }

  if (currPos.x === nextPos.x && currPos.y === nextPos.y) return null;

  return new PIXI.Point(nextPos.x - currPos.x, nextPos.y - currPos.y);
};

export const createOdaRollSystem = (di: IDiContainer): ISystem => {
  const input = di.input();
  const entityStore = di.entityStore();
  const oda = entityStore.first(OdaEntity);
  if (!oda) throw new Error('no Oda for move-oda-system');
  let nextRollPos: PIXI.Point | null = null;

  const rollMechanic = createRollMechanic(input);
  let odasLastState: 'gun' | 'poll' = 'gun';

  return {
    name: () => 'oda-roll-system',
    update: (delta: number) => {
      if (input.option.is.pressed) return;

      if (oda.isRolling && nextRollPos) {
        const collideArea = entityStore
          .getAll(BoundaryBox)
          .filter((o) => isCloseBy(oda.center, o.center))
          .sort(byDistanceAsc(oda.center))
          .map((o) => o.rect);

        const trafficDrums = entityStore
          .getAll(TrafficDrumEntity)
          .filter((o) => isCloseBy(oda.center, o.center))
          .sort(byDistanceAsc(oda.center))
          .map((o) => o.moveRect);

        const zombies = entityStore
          .getAll(ZombieOneEntity)
          .filter((o) => isCloseBy(oda.center, o.center))
          .sort(byDistanceAsc(oda.center))
          .map((o) => o.moveRect);

        const nextPos = getNextMoveAmount({
          entityRect: oda.moveRect,
          collideArea: [...collideArea, ...trafficDrums, ...zombies],
          endPos: nextRollPos,
          speed: 35,
          delta: delta,
        });

        if (nextPos) {
          oda.move(nextPos);
          return;
        } else {
          odasLastState === 'gun' ? oda.setIdleGun() : oda.setIdlePoll();
          nextRollPos = null;
        }
      }

      const rollDirection = rollMechanic.didRoll();

      if (rollDirection) {
        odasLastState = oda.usingGun ? 'gun' : 'poll';
        oda.setRolling();
      }
      const rollDistance = 75;
      switch (rollDirection) {
        case 'up':
          nextRollPos = new PIXI.Point(oda.moveRect.x, oda.moveRect.y - rollDistance);
          break;
        case 'rt':
          nextRollPos = new PIXI.Point(oda.moveRect.x + rollDistance * 1.5, oda.moveRect.y);
          break;
        case 'dn':
          nextRollPos = new PIXI.Point(oda.moveRect.x, oda.moveRect.y + rollDistance);
          break;
        case 'lt':
          nextRollPos = new PIXI.Point(oda.moveRect.x - rollDistance * 1.5, oda.moveRect.y);
          break;
      }
    },
  };
};
