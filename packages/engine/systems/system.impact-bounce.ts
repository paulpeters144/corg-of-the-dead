import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

interface impaceEvent {
  id: string;
  direction: 'right' | 'left';
  power: number;
  moveSpeed: number;
  powerUsed: number;
}

export const createImpactBounceSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const bus = di.eventBus();

  const impactEvents: impaceEvent[] = [];

  bus.on('impactBounce', (e) => {
    impactEvents.push({
      ...e,
      moveSpeed: 100,
      powerUsed: e.power,
    });
  });

  return {
    name: () => 'impact-bounce-system',
    update: (delta: number) => {
      if (impactEvents.length === 0) return;

      for (let i = impactEvents.length - 1; i >= 0; i--) {
        const e = impactEvents[i];
        const entity = entityStore.getById(e.id);
        if (!entity) {
          impactEvents.splice(i, 1);
          continue;
        }

        // Move based on current speed
        const distance = e.moveSpeed * delta;
        entity.ctr.x += e.direction === 'right' ? distance : -distance;

        // Apply friction (0.85 = slows down ~15% per frame)
        e.moveSpeed *= 0.85;

        // Reduce remaining knockback power
        e.powerUsed -= Math.abs(distance);

        // Stop when too weak
        if (e.powerUsed <= 0) {
          impactEvents.splice(i, 1);
        }
      }
    },
  };
};
