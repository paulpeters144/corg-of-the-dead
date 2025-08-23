import * as PIXI from 'pixi.js'
import jsonMetaDataUrl from '@package/assets/levels/demo/test.json';
import { NonTraverseArea } from '../../entity/entity.non-traverse';

const LayerNameArr = ['o-1', 'l-1', 'l-2', 'l-3', 'l-4'] as const;

export type LayerName = (typeof LayerNameArr)[number];

export interface TiledLayerBase {
  id: number;
  name: LayerName;
  opacity: number;
  type: string;
  visible: boolean;
  x: number;
  y: number;
}

export interface TiledTileLayer extends TiledLayerBase {
  data: number[];
  height: number;
  width: number;
  type: 'tilelayer';
}

export interface TiledObjectGroup extends TiledLayerBase {
  draworder: string;
  objects: TiledObject[];
  type: 'objectgroup';
}

export interface TiledObject {
  height: number;
  id: number;
  name: 'sp_mario';
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  gid?: number;
}

export interface TiledTileset {
  firstgid: number;
  source: string;
}

export interface TiledMapMetaData {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: (TiledTileLayer | TiledObjectGroup)[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilesets: TiledTileset[];
  tilewidth: number;
  type: string;
  version: string;
  width: number;
}

export const fetchTileMapMetaData = (): TiledMapMetaData => {
  try {
    return jsonMetaDataUrl as TiledMapMetaData
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createTiledMap = (props: { metaData: TiledMapMetaData; atlas: PIXI.Texture }) => {
  const { metaData, atlas } = props;
  const ctr = new PIXI.Container();

  const getTileAt = (idx: number) => {
    const tileW = metaData.tilewidth;
    const tileH = metaData.tileheight;
    const columnLen = props.atlas.width / tileW;

    const colIdx = (idx - 1) % columnLen;
    const rowIdx = Math.floor((idx - 1) / columnLen);

    const x = tileW * colIdx;
    const y = tileH * rowIdx;
    const tileTexture = new PIXI.Texture({
      source: atlas.source,
      frame: new PIXI.Rectangle(x, y, tileW, tileH),
    });
    tileTexture.source.scaleMode = 'nearest';
    return tileTexture;
  };

  const createTileLayer = (layer: TiledTileLayer) => {
    const layerContainer = new PIXI.Container();
    let tileIndex = -1;

    for (const tileId of layer.data) {
      tileIndex++;
      if (tileId === 0) continue;
      const tileTexture = getTileAt(tileId);
      const tileSprite = new PIXI.Sprite(tileTexture);

      tileSprite.x = (tileIndex % metaData.width) * metaData.tilewidth;
      tileSprite.y = Math.floor(tileIndex / metaData.width) * metaData.tileheight;
      layerContainer.addChild(tileSprite);
    }
    return layerContainer;
  };

  const nonTraversable: NonTraverseArea[] = [];

  for (const layer of metaData.layers) {
    if (layer.type === 'tilelayer') {
      const layerCtr = createTileLayer(layer);
      ctr.addChild(layerCtr);
    }
    if (layer.type === 'objectgroup') {
      for (const obj of layer.objects) {
        const r = new PIXI.Rectangle(obj.x, obj.y, obj.width, obj.height);
        const nonTranverse = new NonTraverseArea({ rect: r });
        nonTraversable.push(nonTranverse);
      }
    }
  }
  return { ctr, metaData };
};
