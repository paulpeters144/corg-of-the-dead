import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createSwingPollSystem = (di: IDiContainer): ISystem => {
  const input = di.input();
  const entityStore = di.entityStore();
  const oda = entityStore.first(OdaEntity);
  if (!oda) throw new Error('oda not found');
  let lastSwing = performance.now();
  return {
    name: () => 'swing-poll-system',
    update: (_: number) => {
      if (!oda.usingPoll) return;

      const now = performance.now();

      if (input.shoot.is.pressed && !oda.isActiveAnim('pollSwing') && now - lastSwing > 500) {
        oda.setPollSwing();
        setTimeout(() => {
          oda.setIdlePoll();
        }, 350);
        lastSwing = performance.now();
      }
    },
  };
};
