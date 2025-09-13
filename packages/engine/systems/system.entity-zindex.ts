import type { Entity } from '../entity/entity';
import { OdaEntity } from '../entity/entity.oda';
import { TrafficDrumEntity } from '../entity/entity.traffic-drum';
import { ZombieOneEntity } from '../entity/entity.zombie-one';
import { ZLayer } from '../types/enums';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createEntityZIndexSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  let interval = 0;
  return {
    name: () => 'entity-zindex-system',
    update: (delta: number) => {
      interval += delta * 50;
      if (interval < 100) return;
      interval = 0;

      const entities: Entity[] = [
        ...entityStore.getAll(OdaEntity),
        ...entityStore.getAll(TrafficDrumEntity),
        ...entityStore.getAll(ZombieOneEntity),
      ];
      for (let i = 0; i < entities.length; i++) {
        const e = entities[i];
        const offetZIndex = 0.0001 * (e.ctr.y + e.ctr.height);
        e.ctr.zIndex = ZLayer.m1 + offetZIndex;
      }
    },
  };
};
