import * as PIXI from 'pixi.js';
import { OdaGunEntity } from '../../entity/eneity.oda-gun';
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

      const odasGun = gunFactory.create({ name: 'shotgun' });

      entityStore.add(
        new OdaEntity({ spriteSheet: assetLoader.getTexture('odaIdle') }),
        new CameraOrbEntity(),
        odasGun,
        new HeadsUpDisplayEntity({
          odaIcon: assetLoader.createSprite('odaHudIcon'),
          weaponIcon: new PIXI.Sprite(odasGun.assets.icon),
        }),
      );

      entityStore.first(HeadsUpDisplayEntity)?.setGunText(`${entityStore.first(OdaGunEntity)?.ammo || 0}`);

      const sortedTrafficDrums = tilemap.trafficDrumPos.sort((a, b) => a.y - b.y);
      for (let i = 0; i < sortedTrafficDrums.length; i++) {
        const pos = sortedTrafficDrums[i];
        const spriteSheet = { spriteSheet: assetLoader.getTexture('trafficDrum') };
        const trafficDrum = new TrafficDrumEntity(spriteSheet);
        trafficDrum.ctr.position.set(pos.x - trafficDrum.ctr.width * 0.5, pos.y - trafficDrum.ctr.height * 0.85);
        trafficDrum.ctr.zIndex = ZLayer.m1 + i * 0.001;
        entityStore.add(trafficDrum);
      }

      const oda = entityStore.first(OdaEntity);
      oda?.setIdle();

      setTimeout(() => {
        oda?.move(new PIXI.Point(100, 300));
        odasGun.ctr.zIndex = ZLayer.m2;
      }, 50);

      entityStore.first(OdaEntity)?.setIdle();
      entityStore.first(OdaEntity)?.setGun(odasGun);

      systemAgg.add(
        createHeadsUpDisplaySystem(di),
        createOdaRollSystem(di),
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
