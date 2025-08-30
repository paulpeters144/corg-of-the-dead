import { OdaGunEntity } from '../entity/eneity.oda-gun';
import type { IAssetLoader } from '../util/asset-loader';

interface CreateGunProps {
  name: 'rifle' | 'shotgun';
}

export interface IGunFactory {
  create: (props: CreateGunProps) => OdaGunEntity;
}

export const createGunFactory = (assetLoader: IAssetLoader): IGunFactory => {
  const create = (props: CreateGunProps) => {
    if (props.name === 'rifle') {
      return new OdaGunEntity({
        sprite: assetLoader.createSprite('rifle1'),
        assets: {
          flash: assetLoader.getTexture('rifle1Flash'),
          icon: assetLoader.getTexture('rifle1Icon'),
          impact: assetLoader.getTexture('rifle1Impact'),
        },
        ammo: 5250,
        damage: 50,
        fireRate: 200,
        range: 30,
        isAutomatic: true,
        spread: 3,
        animationSpeed: 0.5,
        areaSize: 12,
        name: props.name,
      });
    }
    if (props.name === 'shotgun') {
      return new OdaGunEntity({
        sprite: assetLoader.createSprite('shotty1'),
        assets: {
          flash: assetLoader.getTexture('rifle1Flash'),
          icon: assetLoader.getTexture('shotty1Icon'),
          impact: assetLoader.getTexture('rifle1Impact'), // TODO: need correct impact texture
        },
        ammo: 200,
        damage: 35,
        fireRate: 350,
        range: 25,
        isAutomatic: false,
        spread: 7,
        animationSpeed: 0.15,
        areaSize: 15,
        name: props.name,
      });
    }
    throw new Error(`unknonw gun: ${props.name}`);
  };

  return { create };
};
