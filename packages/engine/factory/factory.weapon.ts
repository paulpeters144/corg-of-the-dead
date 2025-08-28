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
        icon: assetLoader.createSprite('rifle1Icon'),
        ammo: 250,
        damage: 25,
        fireRate: 150,
        range: 20,
        isAutomatic: true,
        spread: 1,
        animationSpeed: 0.5,
        name: props.name,
      });
    }
    if (props.name === 'shotgun') {
      return new OdaGunEntity({
        sprite: assetLoader.createSprite('shotty1'),
        icon: assetLoader.createSprite('shotty1Icon'),
        ammo: 200,
        damage: 50,
        fireRate: 250,
        range: 15,
        isAutomatic: false,
        spread: 5,
        animationSpeed: 0.15,
        name: props.name,
      });
    }
    throw new Error(`unknonw gun: ${props.name}`);
  };

  return { create };
};
