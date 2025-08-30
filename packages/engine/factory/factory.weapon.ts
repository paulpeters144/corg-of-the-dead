import { type GunName, OdaGunEntity } from '../entity/eneity.oda-gun';
import { ZLayer } from '../types/enums';
import type { IAssetLoader } from '../util/asset-loader';

interface CreateGunProps {
  name: GunName;
}

export interface IGunFactory {
  create: (props: CreateGunProps) => OdaGunEntity;
}

export const createGunFactory = (assetLoader: IAssetLoader): IGunFactory => {
  const create = (props: CreateGunProps) => {
    if (props.name === 'Rifle') {
      const rifle = new OdaGunEntity({
        sprite: assetLoader.createSprite('rifle1'),
        assets: {
          flash: assetLoader.getTexture('rifle1Flash'),
          icon: assetLoader.getTexture('rifle1Icon'),
          impact: assetLoader.getTexture('rifle1Impact'),
        },
        ammo: 500,
        damage: 25,
        fireRate: 200,
        range: 30,
        isAutomatic: true,
        spread: 1,
        animationSpeed: 0.5,
        areaSize: 12,
        name: props.name,
      });
      rifle.sprite.zIndex = ZLayer.m2;
      return rifle;
    }

    if (props.name === 'Shotgun') {
      const shotgun = new OdaGunEntity({
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
      shotgun.sprite.zIndex = ZLayer.m2;
      return shotgun;
    }

    throw new Error(`unknonw gun: ${props.name}`);
  };

  return { create };
};
