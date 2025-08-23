import type { IDiContainer } from '../../util/di-container';
import type { IScene } from '../scene-engine';
import { createTiledMap, fetchTileMapMetaData } from './tile-map';
import type { IAssetLoader } from '../../util/asset-loader';
import { OdaEntity } from '../../entity/entity.oda';
import { BgEntity, createBackgrounParalaxSystem } from '../../systems/system.parallax';
import { createMoveOdaSystem } from '../../systems/system.move-oda';
import { CameraOrbEntity } from '../../entity/entity.camera-orb';
import type { ISystem } from '../../systems/system.agg';

const createCamOrbSystem = (di: IDiContainer): ISystem => {
  const oda = di.entityStore().first(OdaEntity);
  const orb = di.entityStore().first(CameraOrbEntity);
  if (!oda) throw new Error('create cam orb with no oda entity')
  if (!orb) throw new Error('created cam orb with no orb')
  const orbOffSet = 30;
  return {
    name: () => 'cam-orb-system',
    update: (_: number) => {
      if (oda.isFacingRight) {
        orb.ctr.position.set(
          oda.ctr.x + oda.ctr.width + orbOffSet,
          oda.ctr.y + (oda.ctr.height / 2)
        )
      }

      if (!oda.isFacingRight) {
        orb.ctr.position.set(
          oda.ctr.x - orbOffSet,
          oda.ctr.y + (oda.ctr.height / 2)
        )
      }
    }
  }
}

export const openingScene = (di: IDiContainer): IScene => {
  const assetLoader = di.assetLoader();
  const gameRef = di.gameRef();
  const camera = di.camera();
  const entityStore = di.entityStore();
  const systemAgg = di.systemAgg()

  return {
    load: async () => {
      await assetLoader.preload('atlasDemo', 'odaIdle', 'bg1', 'fg1');

      entityStore.add(
        new BgEntity(assetLoader.createSprite('bg1')),
        new BgEntity(assetLoader.createSprite('bg1')),
        new BgEntity(assetLoader.createSprite('fg1')),
        new BgEntity(assetLoader.createSprite('fg1')),
        new BgEntity(assetLoader.createSprite('fg1')),
      )

      const tilemap = getTileMap(assetLoader);
      gameRef.addChild(tilemap.ctr)
      tilemap.ctr.cullable = true;

      entityStore.add(
        new OdaEntity({ spriteSheet: assetLoader.getTexture('odaIdle') }),
        new CameraOrbEntity(),
      );
      entityStore.first(OdaEntity)?.ctr.position.set(500, 200);

      systemAgg.add(
        createBackgrounParalaxSystem(di),
        createMoveOdaSystem(di),
        createCamOrbSystem(di),
      )

      setTimeout(() => {
        camera.clamp({
          left: tilemap.ctr.x,
          top: tilemap.ctr.y,
          right: tilemap.ctr.width - 40,
          bottom: tilemap.ctr.height,
        });
      }, 500)

      setTimeout(() => {
        entityStore.first(OdaEntity)?.anim.gotoAndPlay(0)
      }, 1000)
    },

    update: (delta: number) => {

      const orb = entityStore.first(CameraOrbEntity)
      if (!orb) return

      systemAgg.update(delta)

      camera.follow(orb.ctr, {
        speed: 8,
        acceleration: 50,
        radius: 0,
      })
    },

    dispose: () => { },
  };
};

const getTileMap = (assetLoader: IAssetLoader) => {
  const metaData = fetchTileMapMetaData()
  const atlas = assetLoader.getTexture('atlasDemo')
  const tilemap = createTiledMap({
    metaData: metaData,
    atlas: atlas,
  })
  return tilemap;
}
