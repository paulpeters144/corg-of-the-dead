import { ZombieOneEntity } from '../entity/entity.zombie-one';
import type { IAssetLoader } from '../util/asset-loader';

type ZombieName = 'one';

export const createZombieFactory = (assetLoader: IAssetLoader) => {
  return {
    create: (name: ZombieName) => {
      switch (name) {
        case 'one': {
          const zombie = new ZombieOneEntity({
            spriteSheet: assetLoader.getTexture('zombieOne'),
          });
          return zombie;
        }
        default:
          throw new Error(`unknown zombie name '${name}'`);
      }
    },
  };
};
