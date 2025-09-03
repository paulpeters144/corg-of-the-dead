import jsonMetaDataUrl from '@package/assets/levels/demo/test.json';
import * as PIXI from 'pixi.js';
import { BoundaryBox } from '../../entity/entity.boundary-box';

const LayerNameArr = ['l-1', 'traffic-drums', 'boundary-boxes'] as const;

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
    return jsonMetaDataUrl as TiledMapMetaData;
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

  const boundaryBoxes: BoundaryBox[] = [];
  const trafficDrumPos: PIXI.Point[] = [];
  for (const layer of metaData.layers) {
    if (layer.type === 'tilelayer') {
      const layerCtr = createTileLayer(layer);
      ctr.addChild(layerCtr);
    }
    if (layer.type === 'objectgroup' && layer.name === 'boundary-boxes') {
      for (const obj of layer.objects) {
        const r = new PIXI.Rectangle(obj.x, obj.y, obj.width, obj.height);
        const box = new BoundaryBox({ rect: r });
        boundaryBoxes.push(box);
      }
    }
    if (layer.type === 'objectgroup' && layer.name === 'traffic-drums') {
      for (const obj of layer.objects) {
        const point = new PIXI.Point(obj.x, obj.y);
        trafficDrumPos.push(point);
      }
    }
  }

  return {
    ctr,
    metaData,
    boundaryBoxes,
    trafficDrumPos,
  };
};
