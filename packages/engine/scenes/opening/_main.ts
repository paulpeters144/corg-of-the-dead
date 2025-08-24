import * as PIXI from 'pixi.js'
import type { IDiContainer } from '../../util/di-container';
import type { IScene } from '../scene-engine';
import { createTiledMap, fetchTileMapMetaData } from './tile-map';
import type { IAssetLoader } from '../../util/asset-loader';
import { OdaEntity } from '../../entity/entity.oda';
import { BgEntity, createBackgrounParalaxSystem } from '../../systems/system.parallax';
import { createMoveOdaSystem } from '../../systems/system.move-oda';
import { CameraOrbEntity } from '../../entity/entity.camera-orb';
import { createCamOrbSystem } from '../../systems/system.cam-orb';
import { TrafficDrumEntity } from '../../entity/entity.traffic-drum';
import { ZLayer } from '../../types/enums';
import { createPlayZIndexSystem } from '../../systems/system.player-zindex';
import { createPlayerShootSystem } from '../../systems/system.player-shoot';

export const openingScene = (di: IDiContainer): IScene => {
  const assetLoader = di.assetLoader();
  const gameRef = di.gameRef();
  const camera = di.camera();
  const entityStore = di.entityStore();
  const systemAgg = di.systemAgg()

  return {
    load: async () => {
      await assetLoader.preload('atlasDemo', 'odaIdle', 'bg1', 'fg1', 'trafficDrum');

      entityStore.add(
        new BgEntity(assetLoader.createSprite('bg1')),
        new BgEntity(assetLoader.createSprite('bg1')),
        new BgEntity(assetLoader.createSprite('fg1')),
        new BgEntity(assetLoader.createSprite('fg1')),
        new BgEntity(assetLoader.createSprite('fg1')),
      )

      const tilemap = getTileMap(assetLoader);
      gameRef.addChild(tilemap.ctr)
      entityStore.add(...tilemap.boundaryBoxes)
      tilemap.ctr.cullable = true;

      entityStore.add(
        new OdaEntity({ spriteSheet: assetLoader.getTexture('odaIdle') }),
        new CameraOrbEntity(),
      );

      const sortedTrafficDrums = tilemap.trafficDrumPos.sort((a, b) => a.y - b.y)
      for (let i = 0; i < sortedTrafficDrums.length; i++) {
        const pos = sortedTrafficDrums[i];
        const spriteSheet = { spriteSheet: assetLoader.getTexture('trafficDrum') };
        const trafficDrum = new TrafficDrumEntity(spriteSheet)
        trafficDrum.ctr.position.set(
          pos.x - trafficDrum.ctr.width * .5,
          pos.y - trafficDrum.ctr.height * .85,
        );
        trafficDrum.ctr.zIndex = ZLayer.m1 + (i * 0.001)

        entityStore.add(trafficDrum)
      }

      entityStore.first(OdaEntity)?.ctr.position.set(100, 300);

      systemAgg.add(
        createPlayerShootSystem(di),
        createPlayZIndexSystem(di),
        createBackgrounParalaxSystem(di),
        createMoveOdaSystem(di),
        createCamOrbSystem(di),
      )

      camera.clamp({
        left: tilemap.ctr.x,
        top: tilemap.ctr.y,
        right: tilemap.ctr.width - 40,
        bottom: tilemap.ctr.height,
      });
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
