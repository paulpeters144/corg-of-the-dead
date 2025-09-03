import odaIdleUrl from '@package/assets/images/actors/player/oda_idle_anim_2.png';
import missedShotUrl from '@package/assets/images/actors/weapons/missed-shot.png';
import poll_sign_url from '@package/assets/images/actors/weapons/poll-sign.png';
import rifle_1_url from '@package/assets/images/actors/weapons/rifle-1.png';
import rifle_1_impact_url from '@package/assets/images/actors/weapons/rifle-1-explosian.png';
import rifle_1_flash_url from '@package/assets/images/actors/weapons/rifle-1-flash.png';
import rifle_1_icon_url from '@package/assets/images/actors/weapons/rifle-1-icon.png';
import shotty_1_Url from '@package/assets/images/actors/weapons/shotty-1.png';
import shotty_1_icon_url from '@package/assets/images/actors/weapons/shotty-1-icon.png';
import weird_gun_1_url from '@package/assets/images/actors/weapons/weird-gun-1.png';
import weird_gun_1_icon_url from '@package/assets/images/actors/weapons/weird-gun-1-icon.png';
import bunnyUrl from '@package/assets/images/bunny.png';
import trafficDrumUrl from '@package/assets/images/objects/traffic_drum.png';
import inputBtnUrl from '@package/assets/images/ui/input-btn.png';
import odaHudIconUrl from '@package/assets/images/ui/oda-hud-icon.png';
import atlasDemoUrl from '@package/assets/levels/demo/Background_CityRuins_Streets.png';
import bg1Url from '@package/assets/levels/demo/bg-1.png';
import fg1Url from '@package/assets/levels/demo/fg-1.png';

import * as PIXI from 'pixi.js';

const assetMap = {
  bunny: bunnyUrl,
  odaIdle: odaIdleUrl,
  atlasDemo: atlasDemoUrl,
  trafficDrum: trafficDrumUrl,
  fg1: fg1Url,
  bg1: bg1Url,
  odaHudIcon: odaHudIconUrl,
  rifle1: rifle_1_url,
  rifle1Icon: rifle_1_icon_url,
  rifle1Impact: rifle_1_impact_url,
  rifle1Flash: rifle_1_flash_url,
  shotty1: shotty_1_Url,
  shotty1Icon: shotty_1_icon_url,
  weirdGun1: weird_gun_1_url,
  weirdGun1Icon: weird_gun_1_icon_url,
  missedShot: missedShotUrl,
  inputBtn: inputBtnUrl,
  pollSign: poll_sign_url,
};

export const assetFilePath = [
  'bunny',
  'atlasDemo',
  'odaIdle',
  'bg1',
  'fg1',
  'trafficDrum',
  'rifle1',
  'rifle1Icon',
  'rifle1Impact',
  'rifle1Flash',
  'shotty1',
  'shotty1Icon',
  'weirdGun1',
  'weirdGun1Icon',
  'odaHudIcon',
  'inputBtn',
  'missedShot',
  'pollSign',
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
    createSprite: (name: AssetName) => {
      const texture = textures[name];
      if (!texture) throw new Error(`asset was not preloaded: "${name}"`);
      const result = new PIXI.Sprite(texture);
      return result;
    },
    getTexture: (name: AssetName) => {
      const result = textures[name];
      if (!result) throw new Error(`asset was not preloaded: "${name}"`);
      return textures[name];
    },
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
