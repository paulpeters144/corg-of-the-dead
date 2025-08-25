import type * as PIXI from 'pixi.js';
import { Entity } from '../entity/entity';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export class BgEntity extends Entity {
  constructor(sprite: PIXI.Sprite) {
    super(sprite);
    sprite.scale.set(1.65);
  }
}

export const createBackgrounParalaxSystem = (di: IDiContainer): ISystem => {
  const camera = di.camera();
  const entityStore = di.entityStore();
  const bgLayers = entityStore.getAll(BgEntity);
  if (bgLayers.length !== 5) throw new Error('bgLayers not correct count');

  const bg1 = bgLayers[0].ctr;
  const bg2 = bgLayers[1].ctr;
  const fg1 = bgLayers[2].ctr;
  const fg2 = bgLayers[3].ctr;
  const fg3 = bgLayers[4].ctr;

  return {
    name: () => 'bg-parallax-system',
    update: (_: number) => {
      const camZeroPos = camera.zeroPos();
      const parallaxFactor = 1.25;
      let baseX = camZeroPos.x + 700;
      bg1.position.set(baseX * parallaxFactor * 0.75, camZeroPos.y * parallaxFactor - 100);
      bg2.position.set(bg1.x - bg2.width, bg1.y);

      baseX = camZeroPos.x + 1100;
      fg1.position.set(baseX * parallaxFactor * 0.6, camZeroPos.y * parallaxFactor * 0.6 - 85);
      fg2.position.set(fg1.x - fg2.width, fg1.y);
      fg3.position.set(fg2.x - fg3.width, fg2.y);
    },
  };
};
