import * as PIXI from 'pixi.js';
import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createDebugSystem = (di: IDiContainer): ISystem => {
  const gameRef = di.gameRef();
  const entityStore = di.entityStore();

  const oda = entityStore.first(OdaEntity);
  if (!oda) throw new Error('oda not found');
  const odaRectGraphic = new PIXI.Graphics()
    .rect(0, 0, oda.rect.width, oda.rect.height)
    .stroke({ width: 1, color: 'white', alpha: 0.5 });
  gameRef.addChild(odaRectGraphic);
  return {
    name: () => 'debug-system',
    update: (_: number) => {
      odaRectGraphic.x = oda.rect.x;
      odaRectGraphic.y = oda.rect.y;
      odaRectGraphic.zIndex = oda.ctr.zIndex + 0.0001;
    },
  };
};
