import * as PIXI from 'pixi.js';
import { CameraOrbEntity } from '../../entity/entity.camera-orb';
import { HeadsUpDisplayEntity } from '../../entity/entity.hud';
import { OdaEntity } from '../../entity/entity.oda';
import { TrafficDrumEntity } from '../../entity/entity.traffic-drum';
import { createPollFactory } from '../../factory/factory.poll';
import { createGunFactory } from '../../factory/factory.weapon';
import { createCamControlSystem } from '../../systems/system.cam-control';
import { createCamOrbSystem } from '../../systems/system.cam-orb';
import { createGunExplosianSystem } from '../../systems/system.gun-explosian';
import { createHeadsUpDisplaySystem } from '../../systems/system.heads-up-display';
import { createInputUISystem } from '../../systems/system.input-ui';
import { createMoveOdaSystem } from '../../systems/system.move-oda';
import { createOdaRollSystem } from '../../systems/system.oda-rolling';
import { BgEntity, createBackgrounParalaxSystem } from '../../systems/system.parallax';
import { createOdaShootSystem } from '../../systems/system.player-shoot';
import { createPlayZIndexSystem } from '../../systems/system.player-zindex';
import { createPollHitAreaSystem } from '../../systems/system.poll-hit-area';
import { createSetGunPosSystem } from '../../systems/system.set-gun-pos';
import { createSetPollPosSystem } from '../../systems/system.set-poll-pos';
import { createSwingPollSystem } from '../../systems/system.swing-poll';
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
  const gunFactory = createGunFactory(assetLoader);
  const pollFactory = createPollFactory(assetLoader);

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
        'parkSignIcon',
        'parkSign',
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
        pollList: [pollFactory.create({ name: 'ParkSign' })],
      });

      gameRef.addChild(oda.weaponCtr);
      entityStore.add(oda, new CameraOrbEntity());
      oda.setActiveWeapon({ type: 'poll', name: 'ParkSign' });

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
        weaponList: [
          ...oda.pollList.map((p) => ({ type: 'poll' as const, weapon: p })),
          ...oda.gunList.map((g) => ({ type: 'gun' as const, weapon: g })),
        ],
      });

      entityStore.add(hud);

      setTimeout(() => {
        oda?.move(new PIXI.Point(100, 300));
      }, 50);

      systemAgg.add(
        createOdaRollSystem(di),
        createHeadsUpDisplaySystem(di),
        createOdaShootSystem(di),
        createCamControlSystem(di),
        createPlayZIndexSystem(di),
        createBackgrounParalaxSystem(di),
        createMoveOdaSystem(di),
        createCamOrbSystem(di),
        createSetGunPosSystem(di),
        createSetPollPosSystem(di),
        createGunExplosianSystem(di),
        createInputUISystem(di),
        createSwingPollSystem(di),
        createPollHitAreaSystem(di),
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
