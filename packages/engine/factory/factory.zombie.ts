import { ZombieOneEntity } from '../entity/entity.zombie-one';
import type { IAssetLoader } from '../util/asset-loader';
import { randNum } from '../util/util';

type ZombieName = 'one';

export const createZombieFactory = (assetLoader: IAssetLoader) => {
  return {
    create: (name: ZombieName) => {
      switch (name) {
        case 'one': {
          const zombie = new ZombieOneEntity({
            spriteSheet: assetLoader.getTexture('zombieOne'),
          });
          setTimeout(
            () => {
              zombie.setAnimation('idle');
            },
            randNum(10, 750),
          );
          return zombie;
        }
        default:
          throw new Error(`unknown zombie name '${name}'`);
      }
    },
  };
};
