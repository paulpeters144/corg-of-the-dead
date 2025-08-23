// import bunnyUrl from '@package/assets/images/bunny.png';
import * as PIXI from 'pixi.js';

// const assetMap = {
//   bunny: bunnyUrl,
// };
//
// export const assetFilePath = ['bunny'] as const;
// export type AssetName = (typeof assetFilePath)[number];
//
// const assertNoMissingAssetName = () => {
//   for (const mapKey in assetMap) {
//     const name = mapKey as AssetName;
//     if (!assetFilePath.includes(name)) {
//       throw new Error(`"${name}" is not a valid AssetName`);
//     }
//   }
// };

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
