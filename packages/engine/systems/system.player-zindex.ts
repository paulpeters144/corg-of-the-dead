
import * as PIXI from 'pixi.js'
import type { ISystem } from './system.agg';
import type { IDiContainer } from '../util/di-container';
import { OdaEntity } from '../entity/entity.oda';
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


export const createPlayZIndexSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore()
  const oda = entityStore.first(OdaEntity)
  if (!oda) throw new Error('no Oda for move-oda-system')
  return {
    name: () => "set-zindex-system",
    update: (_: number) => {

      const closestObj = entityStore
        .getAll(TrafficDrumEntity)
        .filter((o) => Math.abs(o.center.x - oda.center.x) < 66 && Math.abs(o.center.y - oda.center.y) < 65)
        .sort((a, b) => {
          const distA = (a.center.x - oda.center.x) ** 2 + (a.center.y - oda.center.y) ** 2;
          const distB = (b.center.x - oda.center.x) ** 2 + (b.center.y - oda.center.y) ** 2;
          return distA - distB; // put the closest to the front
        })?.at(0);

      // if bottom is blow oda, then increase oda's zindex
      // else decrease oda's zindex

      if (!closestObj) return

      if (oda.moveRect.bottom > closestObj.rect.bottom) {
        oda.ctr.zIndex = closestObj.ctr.zIndex + 0.0001
      } else {
        oda.ctr.zIndex = closestObj.ctr.zIndex - 0.0001
      }
    }
  }
}
