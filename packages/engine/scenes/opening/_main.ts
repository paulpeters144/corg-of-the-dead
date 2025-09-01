import * as PIXI from 'pixi.js';
import { CameraOrbEntity } from '../../entity/entity.camera-orb';
import { HeadsUpDisplayEntity } from '../../entity/entity.hud';
import { OdaEntity } from '../../entity/entity.oda';
import { TrafficDrumEntity } from '../../entity/entity.traffic-drum';
import { createCamControlSystem } from '../../systems/system.cam-control';
import { createCamOrbSystem } from '../../systems/system.cam-orb';
import { createGunExplosianSystem } from '../../systems/system.gun-explosian';
import { createHeadsUpDisplaySystem } from '../../systems/system.heads-up-display';
import { createInputUISystem } from '../../systems/system.input-ui';
import { createMoveOdaSystem } from '../../systems/system.move-oda';
import { createOdaRollSystem } from '../../systems/system.oda-rolling';
import { BgEntity, createBackgrounParalaxSystem } from '../../systems/system.parallax';
import { createPlayerShootSystem } from '../../systems/system.player-shoot';
import { createPlayZIndexSystem } from '../../systems/system.player-zindex';
import { createSetPlayerGunPosSystem } from '../../systems/system.set-gun-pos';
import { ZLayer } from '../../types/enums';
import type { IAssetLoader } from '../../util/asset-loader';
import type { IDiContainer } from '../../util/di-container';
import type { IScene } from '../scene-engine';
import { createTiledMap, fetchTileMapMetaData } from './tile-map';

export const openingScene = (di: IDiContainer): IScene => {
  const assetLoader = di.assetLoader();
  const gameRef = di.gameRef();
  const camera = di.camera();
  const entityStore = di.entityStore();
  const systemAgg = di.systemAgg();
  const gunFactory = di.gunFactory();

  return {
    load: async () => {
      await assetLoader.preload(
        'atlasDemo',
        'odaIdle',
        'bg1',
        'fg1',
        'trafficDrum',
        'rifle1',
        'rifle1Icon',
        'rifle1Impact',
        'missedShot',
        'rifle1Flash',
        'shotty1',
        'shotty1Icon',
        'weirdGun1',
        'odaHudIcon',
        'weirdGun1Icon',
        'inputBtn',
      );

      entityStore.add(
        new BgEntity(assetLoader.createSprite('bg1')),
        new BgEntity(assetLoader.createSprite('bg1')),
        new BgEntity(assetLoader.createSprite('fg1')),
        new BgEntity(assetLoader.createSprite('fg1')),
        new BgEntity(assetLoader.createSprite('fg1')),
      );

      const tilemap = getTileMap(assetLoader);
      gameRef.addChild(tilemap.ctr);
      entityStore.add(...tilemap.boundaryBoxes);
      tilemap.ctr.cullable = true;

      const oda = new OdaEntity({
        spriteSheet: assetLoader.getTexture('odaIdle'),
        gunList: [
          gunFactory.create({ name: 'Rifle' }),
          gunFactory.create({ name: 'Shotgun' }),
          gunFactory.create({ name: 'Raygun' }),
        ],
      });
      oda.setIdle();

      gameRef.addChild(oda.gunCtr);
      entityStore.add(oda, new CameraOrbEntity());

      const sortedTrafficDrums = tilemap.trafficDrumPos.sort((a, b) => a.y - b.y);
      for (let i = 0; i < sortedTrafficDrums.length; i++) {
        const pos = sortedTrafficDrums[i];
        const spriteSheet = { spriteSheet: assetLoader.getTexture('trafficDrum') };
        const trafficDrum = new TrafficDrumEntity(spriteSheet);
        trafficDrum.ctr.position.set(pos.x - trafficDrum.ctr.width * 0.5, pos.y - trafficDrum.ctr.height * 0.85);
        trafficDrum.ctr.zIndex = ZLayer.m1 + i * 0.001;
        entityStore.add(trafficDrum);
      }

      const hud = new HeadsUpDisplayEntity({
        odaIcon: assetLoader.createSprite('odaHudIcon'),
        gunList: oda.gunList,
      });

      entityStore.add(hud);

      setTimeout(() => {
        oda?.move(new PIXI.Point(100, 300));
      }, 50);

      systemAgg.add(
        createOdaRollSystem(di),
        createHeadsUpDisplaySystem(di),
        createPlayerShootSystem(di),
        createCamControlSystem(di),
        createPlayZIndexSystem(di),
        createBackgrounParalaxSystem(di),
        createMoveOdaSystem(di),
        createCamOrbSystem(di),
        createSetPlayerGunPosSystem(di),
        createGunExplosianSystem(di),
        createInputUISystem(di),
      );

      camera.clamp({
        left: tilemap.ctr.x,
        top: tilemap.ctr.y,
        right: tilemap.ctr.width - 40,
        bottom: tilemap.ctr.height,
      });
    },

    update: (delta: number) => {
      camera.update(delta);
      systemAgg.update(delta);
    },

    dispose: () => {},
  };
};

const getTileMap = (assetLoader: IAssetLoader) => {
  const metaData = fetchTileMapMetaData();
  const atlas = assetLoader.getTexture('atlasDemo');
  const tilemap = createTiledMap({
    metaData: metaData,
    atlas: atlas,
  });
  return tilemap;
};
