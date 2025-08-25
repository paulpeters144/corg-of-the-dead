import * as PIXI from 'pixi.js'
import type { ISystem } from './system.agg';
import type { IDiContainer } from '../util/di-container';
import { OdaEntity } from '../entity/entity.oda';
import { BoundaryBox } from '../entity/entity.boundary-box';
import { TrafficDrumEntity } from '../entity/entity.traffic-drum';


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
  input: {
    up: boolean
    right: boolean
    left: boolean
    down: boolean
  };
  speed: { x: number, y: number };
  delta: number;
}

export const getNextMoveAmount = (props: IUpdatePosProps): PIXI.Point | null => {
  const { entityRect, delta, collideArea, speed, input } = props;

  const currPos = entityRect.clone();
  const nextPos = entityRect.clone();

  // --- Horizontal movement first ---
  if (input.right) {
    nextPos.x += speed.x * delta;
  }
  if (input.left) {
    nextPos.x -= speed.x * delta;
  }

  for (const rect of collideArea.filter((c) => c.intersects(nextPos))) {
    if (collides(nextPos).leftOf(rect)) {
      nextPos.x = rect.x - nextPos.width;
    }
    if (collides(nextPos).rightOf(rect)) {
      nextPos.x = rect.x + rect.width;
    }
  }

  // --- Vertical movement second ---
  if (input.down) {
    nextPos.y += speed.y * delta;
  }
  if (input.up) {
    nextPos.y -= speed.y * delta;
  }

  for (const rect of collideArea.filter((c) => c.intersects(nextPos))) {
    if (collides(nextPos).topOf(rect)) {
      nextPos.y = rect.y - nextPos.height;
    }
    if (collides(nextPos).bottomOf(rect)) {
      nextPos.y = rect.y + rect.height;
    }
  }

  if (currPos.x === nextPos.x && currPos.y === nextPos.y)
    return null

  const result = new PIXI.Point();

  if (currPos.x !== nextPos.x) {
    result.x = nextPos.x - currPos.x
  }
  if (currPos.y !== nextPos.y) {
    result.y = nextPos.y - currPos.y
  }

  return result;
};

export const createMoveOdaSystem = (di: IDiContainer): ISystem => {
  const input = di.input()
  const entityStore = di.entityStore()
  const oda = entityStore.first(OdaEntity)
  if (!oda) throw new Error('no Oda for move-oda-system')

  return {
    name: () => "move-oda-system",
    update: (delta: number) => {
      if (oda.isShooting) return;

      const upPressed = input.up.is.pressed && !input.down.is.pressed
      const dnPressed = input.down.is.pressed && !input.up.is.pressed
      const rtPressed = input.right.is.pressed && !input.left.is.pressed
      const ltPressed = input.left.is.pressed && !input.right.is.pressed

      const isIdle = !upPressed && !dnPressed && !rtPressed && !ltPressed

      const collideArea = entityStore
        .getAll(BoundaryBox)
        .filter((o) => Math.abs(o.center.x - oda.center.x) < 66 && Math.abs(o.center.y - oda.center.y) < 150)
        .sort((a, b) => {
          const distA = (a.center.x - oda.center.x) ** 2 + (a.center.y - oda.center.y) ** 2;
          const distB = (b.center.x - oda.center.x) ** 2 + (b.center.y - oda.center.y) ** 2;
          return distA - distB; // put the closest to the front
        })
        .map((o) => o.rect);

      const trafficDrums = entityStore
        .getAll(TrafficDrumEntity)
        .filter((o) => Math.abs(o.center.x - oda.center.x) < 66 && Math.abs(o.center.y - oda.center.y) < 150)
        .sort((a, b) => {
          const distA = (a.center.x - oda.center.x) ** 2 + (a.center.y - oda.center.y) ** 2;
          const distB = (b.center.x - oda.center.x) ** 2 + (b.center.y - oda.center.y) ** 2;
          return distA - distB; // put the closest to the front
        })
        .map((o) => o.rect);

      const nextMoveAmount = getNextMoveAmount({
        entityRect: oda.moveRect,
        collideArea: [...collideArea, ...trafficDrums],
        input: {
          up: upPressed,
          right: rtPressed,
          down: dnPressed,
          left: ltPressed,
        },
        speed: {
          x: 15,
          y: 8.75
        },
        delta: delta
      })

      if (nextMoveAmount !== null) {
        oda.move(nextMoveAmount);
      }

      const moved = !!nextMoveAmount

      if (moved && !oda.isRunning) {
        oda.setRunning();
      }
      if (!moved && oda.isRunning) {
        oda.setIdle()
      }
      if (isIdle && oda.isRunning) {
        oda.setIdle()
      }

      if (ltPressed && oda.isFacingRight) oda.faceLeft()
      if (rtPressed && !oda.isFacingRight) oda.faceRight()
    }
  }
}
