import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

interface HitEvent {
  id: string;
  direction: 'right' | 'left';
  damage: number;
}

export const createZombieHitSystem = (di: IDiContainer): ISystem => {
  const bus = di.eventBus();

  const events: HitEvent[] = [];

  bus.on('zombiePollHit', e => {

  })

  return {
    name: () => 'zombie-hit-system',
    update: (_: number) => {
      if (events.length === 0) return;
    },
  }
};
