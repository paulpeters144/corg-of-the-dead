import * as PIXI from 'pixi.js'
import type { ISystem } from './system.agg';
import type { IDiContainer } from '../util/di-container';
import { OdaEntity } from '../entity/entity.oda';
import type { Entity } from '../entity/entity';


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

interface IUpdatePosResult {
  nextPos: PIXI.Rectangle;
}

export const getNextPosition = (props: IUpdatePosProps): IUpdatePosResult => {
  const { entityRect, delta, collideArea, speed, input } = props;

  const currPos = entityRect.clone();
  const nextPos = currPos.clone();

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

  return { nextPos: nextPos };
};


export const createMoveOdaSystem = (di: IDiContainer): ISystem => {
  const input = di.input()
  const entityStore = di.entityStore()
  const oda = entityStore.first(OdaEntity)
  if (!oda) throw new Error('no Oda for move-oda-system')
  return {
    name: () => "move-oda-system",
    update: (delta: number) => {
      const speed = 8.45;
      const horzIncrease = 1.75;

      const upPressed = input.up.is.pressed
      const dnPressed = input.down.is.pressed
      const rtPressed = input.right.is.pressed
      const ltPressed = input.left.is.pressed

      const isIdle = !upPressed && !dnPressed && !rtPressed && !ltPressed

      const { nextPos } = getNextPosition({
        entityRect: oda.rect,
        collideArea: [],
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

      const moved = oda.ctr.x !== nextPos.x || oda.ctr.y !== nextPos.y

      if (moved && !oda.isRunning) {

        oda.setRunning();
      }

      if (isIdle && oda.isRunning) {
        console.log('[.setIdle()]', 'HIT!!!')
        oda.setIdle()
      }

      if (oda.ctr.x !== nextPos.x) {
        oda.ctr.x = nextPos.x;
      }
      if (oda.ctr.y !== nextPos.y) {
        oda.ctr.y = nextPos.y;
      }

      if (ltPressed && oda.isFacingRight) oda.faceLeft()
      if (rtPressed && !oda.isFacingRight) oda.faceRight()
    }
  }
}
