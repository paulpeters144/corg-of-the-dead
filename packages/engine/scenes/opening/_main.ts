import * as PIXI from 'pixi.js';
import type { IDiContainer } from '../../util/di-container';
import type { IScene } from '../scene-engine';
import { createTiledMap, fetchTileMapMetaData } from './tile-map';
import type { IAssetLoader } from '../../util/asset-loader';
import { OdaEntity } from '../../entity/entity.oda';
import type { Position } from '../../types/types';

export const openingScene = (di: IDiContainer): IScene => {
  const assetLoader = di.assetLoader();
  const gameRef = di.gameRef();
  const camera = di.camera();
  const entityStore = di.entityStore();
  const input = di.input();

  let bg1: PIXI.Sprite | undefined;
  let bg2: PIXI.Sprite | undefined;

  let fg1: PIXI.Sprite | undefined;
  let fg2: PIXI.Sprite | undefined;
  let fg3: PIXI.Sprite | undefined;

  return {
    load: async () => {
      await assetLoader.preload('atlasDemo', 'odaIdle', 'bg1', 'fg1');

      bg1 = assetLoader.createSprite('bg1')
      bg1.scale.set(1.65)
      bg2 = assetLoader.createSprite('bg1')
      bg2.scale.set(1.65)

      fg1 = assetLoader.createSprite('fg1')
      fg1.scale.set(1.65)
      fg2 = assetLoader.createSprite('fg1')
      fg2.scale.set(1.65)
      fg3 = assetLoader.createSprite('fg1')
      fg3.scale.set(1.65)

      gameRef.addChild(bg1, bg2, fg1, fg2, fg3)


      const tilemap = getTileMap(assetLoader);
      gameRef.addChild(tilemap.ctr)
      tilemap.ctr.cullable = true;


      entityStore.add(
        new OdaEntity({ spriteSheet: assetLoader.getTexture('odaIdle') }),
      );
      entityStore.first(OdaEntity)?.ctr.position.set(500, 200);


      setTimeout(() => {
        camera.animate({
          position: new PIXI.Point(1200, 250),
          scale: 0.0001,
        })
        camera.clamp({
          left: tilemap.ctr.x,
          top: tilemap.ctr.y,
          right: tilemap.ctr.width - 35,
          bottom: tilemap.ctr.height,
        });
      }, 500)
    },

    update: (delta: number) => {

      const oda = entityStore.first(OdaEntity)
      if (!oda) return

      camera.follow(oda.ctr)

      const camZeroPos = camera.zeroPos()
      updatePosForParallax({ camZeroPos, bg1, bg2, fg1, fg2, fg3 })

      if (input.down.is.pressed) {
        oda.ctr.y += 20 * delta
      }
      if (input.right.is.pressed) {
        oda.ctr.x += 35 * delta
      }
      if (input.left.is.pressed) {
        oda.ctr.x -= 35 * delta
      }
      if (input.up.is.pressed) {
        oda.ctr.y -= 20 * delta
      }

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


const updatePosForParallax = (props: {
  camZeroPos: Position;
  bg1?: PIXI.Sprite;
  bg2?: PIXI.Sprite;
  fg1?: PIXI.Sprite;
  fg2?: PIXI.Sprite;
  fg3?: PIXI.Sprite;
}) => {
  const { camZeroPos, bg1, bg2, fg1, fg2, fg3 } = props;
  if (!bg1 || !bg2 || !fg1 || !fg2 || !fg3) return;
  const parallaxFactor = 1.25;
  let baseX = camZeroPos.x + 700;
  bg1.position.set(baseX * parallaxFactor * .75, camZeroPos.y * parallaxFactor - 100);
  bg2.position.set(bg1.x - bg2.width, bg1.y);

  baseX = camZeroPos.x + 1100;
  fg1.position.set(baseX * parallaxFactor * 0.6, camZeroPos.y * parallaxFactor * 0.6 - 20);
  fg2.position.set(fg1.x - fg2.width, fg1.y);
  fg3.position.set(fg2.x - fg3.width, fg2.y);
};
