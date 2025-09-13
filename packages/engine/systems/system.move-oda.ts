import * as PIXI from 'pixi.js';
import { BoundaryBox } from '../entity/entity.boundary-box';
import { OdaEntity } from '../entity/entity.oda';
import { TrafficDrumEntity } from '../entity/entity.traffic-drum';
import { ZombieOneEntity } from '../entity/entity.zombie-one';
import type { IDiContainer } from '../util/di-container';
import { byDistanceAsc, isCloseBy } from '../util/util';
import type { ISystem } from './system.agg';

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
    up: boolean;
    right: boolean;
    left: boolean;
    down: boolean;
    walking: boolean;
  };
  speed: { x: number; y: number };
  delta: number;
}

export const getNextMoveAmount = (props: IUpdatePosProps): PIXI.Point | null => {
  const { entityRect, delta, collideArea, speed, input } = props;

  const currPos = entityRect.clone();
  const nextPos = entityRect.clone();

  // --- Horizontal movement first ---
  let moveAmount = speed.x * delta * (input.walking ? 0.6 : 1);
  if (input.right) {
    nextPos.x += moveAmount;
  }
  if (input.left) {
    nextPos.x -= moveAmount;
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
  moveAmount = speed.y * delta * (input.walking ? 0.6 : 1);
  if (input.down) {
    nextPos.y += moveAmount;
  }
  if (input.up) {
    nextPos.y -= moveAmount;
  }

  for (const rect of collideArea.filter((c) => c.intersects(nextPos))) {
    if (collides(nextPos).topOf(rect)) {
      nextPos.y = rect.y - nextPos.height;
    }
    if (collides(nextPos).bottomOf(rect)) {
      nextPos.y = rect.y + rect.height;
    }
  }

  if (currPos.x === nextPos.x && currPos.y === nextPos.y) return null;

  const result = new PIXI.Point();

  if (currPos.x !== nextPos.x) {
    result.x = nextPos.x - currPos.x;
  }
  if (currPos.y !== nextPos.y) {
    result.y = nextPos.y - currPos.y;
  }

  return result;
};

export const createMoveOdaSystem = (di: IDiContainer): ISystem => {
  const input = di.input();
  const entityStore = di.entityStore();
  const oda = entityStore.first(OdaEntity);
  if (!oda) throw new Error('no Oda for move-oda-system');

  const handleOptionPause = () => {
    if (input.option.is.pressed) {
      if (oda.anim.playing) {
        oda.anim.stop();
      }
      return true;
    } else if (input.option.is.released) {
      if (!oda.anim.playing) {
        oda.anim.play();
      }
    }
    return false;
  };

  const handleMoveWithGun = (props: {
    delta: number;
    upPressed: boolean;
    dnPressed: boolean;
    rtPressed: boolean;
    ltPressed: boolean;
    collidables: PIXI.Rectangle[];
  }) => {
    const { delta, upPressed, dnPressed, rtPressed, ltPressed, collidables } = props;
    const nextMoveAmount = getNextMoveAmount({
      entityRect: oda.moveRect,
      collideArea: collidables,
      input: {
        up: upPressed,
        right: rtPressed,
        down: dnPressed,
        left: ltPressed,
        walking: oda.isWalking,
      },
      speed: {
        x: 15,
        y: 8.75,
      },
      delta: delta,
    });

    if (nextMoveAmount !== null) {
      oda.move(nextMoveAmount);
    }

    if (oda.isRolling) return;
    if (oda.isWalking && input.walk.is.pressed) return;

    const moved = !!nextMoveAmount;

    const isWalking = oda.isWalking;
    const isRunning = oda.isRunning;
    const isMoving = isWalking || isRunning;
    const isShooting = input.shoot.is.pressed;

    if (oda.usingGun) {
      if (!moved && isMoving) {
        oda.setIdleGun();
      } else if (moved && !isMoving && !isShooting) {
        oda.setGunRun();
      } else if (moved && isShooting && (isRunning || oda.isIdle)) {
        oda.setGunWalk();
      } else if (!isShooting && oda.isWalking) {
        oda.setGunRun();
      }

      if (input.walk.is.pressed && !oda.isWalking) {
        oda.setGunWalk();
      }
    }

    if (isRunning) {
      if (ltPressed && oda.isFacingRight) oda.faceLeft();
      if (rtPressed && !oda.isFacingRight) oda.faceRight();
    }
  };

  const handleMoveWithPoll = (props: {
    delta: number;
    upPressed: boolean;
    dnPressed: boolean;
    rtPressed: boolean;
    ltPressed: boolean;
    collidables: PIXI.Rectangle[];
  }) => {
    if (oda.isActiveAnim('pollSwing')) return;

    const { delta, upPressed, dnPressed, rtPressed, ltPressed, collidables } = props;
    const nextMoveAmount = getNextMoveAmount({
      entityRect: oda.moveRect,
      collideArea: collidables,
      input: {
        up: upPressed,
        right: rtPressed,
        down: dnPressed,
        left: ltPressed,
        walking: oda.isWalking,
      },
      speed: {
        x: 15,
        y: 8.75,
      },
      delta: delta,
    });

    if (nextMoveAmount !== null) {
      oda.move(nextMoveAmount);
    }

    if (oda.isRolling) return;
    if (oda.isWalking && input.walk.is.pressed) return;

    const moved = !!nextMoveAmount;

    const isWalking = oda.isWalking;
    const isRunning = oda.isRunning;
    const isMoving = isWalking || isRunning;
    const isShooting = input.shoot.is.pressed;

    if (oda.usingPoll) {
      if (!moved && isMoving) {
        oda.setIdlePoll();
      } else if (moved && !isMoving && !isShooting) {
        oda.setPollRun();
      } else if (moved && isShooting && (isRunning || oda.isIdle)) {
        oda.setPollRun();
      } else if (!isShooting && oda.isWalking) {
        oda.setPollRun();
      }
    }

    if (isRunning) {
      if (ltPressed && oda.isFacingRight) oda.faceLeft();
      if (rtPressed && !oda.isFacingRight) oda.faceRight();
    }
  };

  return {
    name: () => 'move-oda-system',
    update: (delta: number) => {
      if (oda.isRolling) return;
      if (handleOptionPause()) return;

      const upPressed = input.up.is.pressed && !input.down.is.pressed;
      const dnPressed = input.down.is.pressed && !input.up.is.pressed;
      const rtPressed = input.right.is.pressed && !input.left.is.pressed;
      const ltPressed = input.left.is.pressed && !input.right.is.pressed;

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

      const collidables = [...collideArea, ...trafficDrums, ...zombies];

      if (oda.usingGun)
        handleMoveWithGun({
          delta: delta,
          upPressed: upPressed,
          dnPressed: dnPressed,
          rtPressed: rtPressed,
          ltPressed: ltPressed,
          collidables: collidables,
        });

      if (oda.usingPoll)
        handleMoveWithPoll({
          delta: delta,
          upPressed: upPressed,
          dnPressed: dnPressed,
          rtPressed: rtPressed,
          ltPressed: ltPressed,
          collidables: collidables,
        });
    },
  };
};
