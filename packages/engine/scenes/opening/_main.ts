import * as PIXI from 'pixi.js';
import { CameraOrbEntity } from '../../entity/entity.camera-orb';
import { HeadsUpDisplayEntity } from '../../entity/entity.hud';
import { OdaEntity } from '../../entity/entity.oda';
import { TrafficDrumEntity } from '../../entity/entity.traffic-drum';
import { createPollFactory } from '../../factory/factory.poll';
import { createGunFactory } from '../../factory/factory.weapon';
import { createZombieFactory } from '../../factory/factory.zombie';
import * as system from '../../systems';
import { BgEntity } from '../../systems/system.parallax';
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
  const zombieFactory = createZombieFactory(assetLoader);

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
        'zombieOne',
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
      oda.setActiveWeapon({ type: 'gun', name: 'Rifle' });

      for (let i = 0; i < tilemap.trafficDrumPos.length; i++) {
        const pos = tilemap.trafficDrumPos[i];
        const spriteSheet = { spriteSheet: assetLoader.getTexture('trafficDrum') };
        const trafficDrum = new TrafficDrumEntity(spriteSheet);
        trafficDrum.ctr.position.set(pos.x - trafficDrum.ctr.width * 0.5, pos.y - trafficDrum.ctr.height * 0.85);
        entityStore.add(trafficDrum);
      }

      for (let i = 0; i < tilemap.basicZombiesPos.length; i++) {
        const pos = tilemap.basicZombiesPos[i];
        const zombie = zombieFactory.create('one');
        zombie.ctr.position.set(pos.x - zombie.ctr.width * 0.5, pos.y - zombie.ctr.height * 0.85);
        entityStore.add(zombie);
      }

      const hud = new HeadsUpDisplayEntity({
        odaIcon: assetLoader.createSprite('odaHudIcon'),
        weaponList: [
          ...oda.gunList.map((g) => ({ type: 'gun' as const, weapon: g })),
          ...oda.pollList.map((p) => ({ type: 'poll' as const, weapon: p })),
        ],
      });

      entityStore.add(hud);

      setTimeout(() => {
        oda?.move(new PIXI.Point(100, 300));
        camera.animate({
          time: 0,
          position: { x: oda.ctr.x, y: oda.ctr.y },
        });
        // zombie.ctr.position.set(200, 300);
        // zombie.setAnimation('idle');
        // zombie.faceRight();
      }, 50);

      systemAgg.add(
        system.createOdaRollSystem(di),
        system.createHeadsUpDisplaySystem(di),
        system.createOdaShootSystem(di),
        system.createCamControlSystem(di),
        system.createBackgrounParalaxSystem(di),
        system.createMoveOdaSystem(di),
        system.createCamOrbSystem(di),
        system.createSetGunPosSystem(di),
        system.createSetPollPosSystem(di),
        system.createGunExplosianSystem(di),
        system.createInputUISystem(di),
        system.createSwingPollSystem(di),
        system.createPollHitAreaSystem(di),
        system.createImpactBounceSystem(di),
        system.createEntityZIndexSystem(di),
        system.createZombieHitSystem(di),
        system.createZombieMoveSystem(di),
        // system.createDebugSystem(di),
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
