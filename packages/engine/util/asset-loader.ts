import * as PIXI from 'pixi.js';

import bunnyUrl from '@package/assets/images/bunny.png';
import atlasDemoUrl from '@package/assets/levels/demo/Background_CityRuins_Streets.png';
import odaIdleUrl from '@package/assets/images/actors/player/oda_idle_anim_2.png';
import firstRifle from '@package/assets/images/actors/weapons/first-rifle.png';
import wirdGunUrl from '@package/assets/images/actors/weapons/weird-gun.png';
import blueShotUrl from '@package/assets/images/actors/weapons/blue-shotty.png';
import trafficDrumUrl from '@package/assets/images/objects/traffic_drum.png';
import fg1Url from '@package/assets/levels/demo/fg-1.png';
import bg1Url from '@package/assets/levels/demo/bg-1.png';


const assetMap = {
  bunny: bunnyUrl,
  odaIdle: odaIdleUrl,
  atlasDemo: atlasDemoUrl,
  trafficDrum: trafficDrumUrl,
  fg1: fg1Url,
  bg1: bg1Url,
  firstRifle: firstRifle,
  blueShot: blueShotUrl,
  weirdGun: wirdGunUrl,
};

export const assetFilePath = [
  'bunny', 'atlasDemo', 'odaIdle', 'bg1', 'fg1', 'trafficDrum',
  'firstRifle', 'blueShot', 'weirdGun',
] as const;
export type AssetName = (typeof assetFilePath)[number];

const assertNoMissingAssetName = () => {
  for (const mapKey in assetMap) {
    const name = mapKey as AssetName;
    if (!assetFilePath.includes(name)) {
      throw new Error(`"${name}" is not a valid AssetName`);
    }
  }
};

export interface IAssetLoader {
  createSprite: (name: AssetName) => PIXI.Sprite;
  preload: (...names: AssetName[]) => Promise<void>;
  getTexture: (name: AssetName) => PIXI.Texture;
}

export const createAssetLoader = (): IAssetLoader => {
  const textures: Record<string, PIXI.Texture> = {};
  assertNoMissingAssetName();

  return {
    createSprite: (name: AssetName) => new PIXI.Sprite(textures[name]),
    getTexture: (name: AssetName) => textures[name],
    preload: async (...assetNames: AssetName[]) => {
      PIXI.Assets.reset();
      for (const key of assetNames) {
        const path = assetMap[key];
        PIXI.Assets.add({ alias: key, src: path });
      }
      const assets = await PIXI.Assets.load(assetNames);
      for (const key of Object.keys(assets)) {
        if (!assets[key]) continue;
        textures[key] = assets[key];
        textures[key].source.scaleMode = 'nearest';
      }
    },
  };
};
