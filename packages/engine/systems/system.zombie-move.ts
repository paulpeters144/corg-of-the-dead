import * as PIXI from 'pixi.js';
import { OdaEntity } from '../entity/entity.oda';
import { ZombieOneEntity } from '../entity/entity.zombie-one';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

const getNextZombiePos = (props: { zombie: ZombieOneEntity; delta: number }) => {
  const { zombie, delta } = props;

  if (!zombie.pathData.nextPos) return undefined;
  const { nextPos } = zombie.pathData;
  const result = new PIXI.Point(zombie.ctr.x, zombie.ctr.y);

  if (nextPos.x > result.x) {
    result.x += 10 * delta;
    if (result.x > nextPos.x) {
      result.x = nextPos.x;
    }
  }
  if (nextPos.x < result.x) {
    result.x -= 10 * delta;
    if (result.x < nextPos.x) {
      result.x = nextPos.x;
    }
  }

  if (nextPos.y > result.y) {
    result.y += 10 * delta;
    if (result.y > nextPos.y) {
      result.y = nextPos.y;
    }
  }
  if (nextPos.y < result.y) {
    result.y -= 10 * delta;
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
      for (const zombie of entityStore.getAll(ZombieOneEntity)) {
        if (!zombie.pathData.nextPos) {
          zombie.pathData.nextPos = new PIXI.Point(oda.ctr.x, oda.ctr.y);
        }
        const nextPos = getNextZombiePos({ zombie, delta });
        if (nextPos) zombie.ctr.position.set(nextPos.x, nextPos.y);
      }
    },
  };
};
