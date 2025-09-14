import { type GunName, OdaGunEntity } from '../entity/entity.oda-gun';
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
        fireRate: 175,
        range: 30,
        isAutomatic: true,
        spread: 1,
        animationSpeed: 0.5,
        areaSize: 12,
        name: props.name,
        tracer: 1,
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
          impact: assetLoader.getTexture('rifle1Impact'),
        },
        ammo: 200,
        damage: 20,
        fireRate: 350,
        range: 20,
        isAutomatic: false,
        spread: 7,
        animationSpeed: 0.15,
        areaSize: 12,
        name: props.name,
      });
      shotgun.sprite.zIndex = ZLayer.m2;
      return shotgun;
    }

    if (props.name === 'Raygun') {
      const shotgun = new OdaGunEntity({
        sprite: assetLoader.createSprite('weirdGun1'),
        assets: {
          flash: assetLoader.getTexture('rifle1Flash'),
          icon: assetLoader.getTexture('weirdGun1Icon'),
          impact: assetLoader.getTexture('rifle1Impact'),
        },
        ammo: 200,
        damage: 50,
        fireRate: 250,
        range: 50,
        isAutomatic: false,
        spread: 1,
        animationSpeed: 0.15,
        areaSize: 8,
        name: props.name,
        tracer: 5,
        piercing: true,
      });
      shotgun.sprite.zIndex = ZLayer.m2;
      return shotgun;
    }

    throw new Error(`unknonw gun: ${props.name}`);
  };

  return { create };
};
