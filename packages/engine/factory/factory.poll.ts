import * as PIXI from 'pixi.js';
import { OdaPollEntity, type PollName } from '../entity/entity.oda-poll';
import { ZLayer } from '../types/enums';
import type { IAssetLoader } from '../util/asset-loader';

interface CreatePollProps {
  name: PollName;
}

export interface IPollFactory {
  create: (props: CreatePollProps) => OdaPollEntity;
}

const createAnimations = (texture: PIXI.Texture) => {
  const size = 48;
  const row = 0;
  const textures = Array.from({ length: 4 }, (_, i) => {
    const t = new PIXI.Texture({
      source: texture.source,
      frame: new PIXI.Rectangle(size * i, size * row, size, size),
    });
    t.source.scaleMode = 'nearest';
    return t;
  });
  return textures;
};

export const createPollFactory = (assetLoader: IAssetLoader): IPollFactory => {
  const create = (props: CreatePollProps) => {
    if (props.name === 'ParkSign') {
      const textures = createAnimations(assetLoader.getTexture('parkSign'));
      const anim = new PIXI.AnimatedSprite({ textures });
      const parkSign = new OdaPollEntity({
        anim: anim,
        assets: {
          flash: assetLoader.getTexture('rifle1'),
          icon: assetLoader.getTexture('parkSignIcon'),
          impact: assetLoader.getTexture('rifle1'),
        },
        name: 'ParkSign',
        health: 100,
        hitRate: 10,
        damage: 45,
      });

      parkSign.anim.zIndex = ZLayer.m1;
      return parkSign;
    }

    throw new Error(`unknonw gun: ${props.name}`);
  };

  return { create };
};
