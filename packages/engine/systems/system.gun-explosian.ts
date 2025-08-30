import * as PIXI from 'pixi.js';
import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createGunExplosianSystem = (di: IDiContainer): ISystem => {
  const bus = di.eventBus();
  const gameRef = di.gameRef();
  const assetLoader = di.assetLoader();
  const oda = di.entityStore().first(OdaEntity);

  if (!oda || !oda.gun) throw new Error('oda gun not found');

  let size = 32;
  const shotHitTextures = Array.from({ length: 5 }, (_, i) => {
    const t = new PIXI.Texture({
      source: oda.gun?.assets.impact.source,
      frame: new PIXI.Rectangle(size * i, 0, size, size),
    });
    t.source.scaleMode = 'nearest';
    return t;
  });

  bus.on('shotHit', (e) => {
    if (!oda) return;
    const anim = new PIXI.AnimatedSprite({ textures: shotHitTextures });
    anim.animationSpeed = 0.35;
    gameRef.addChild(anim);
    anim.position.set(oda.isFacingRight ? e.area.left - 15 : e.area.right - 15, e.area.y);
    anim.zIndex = 9999;
    anim.gotoAndPlay(0);
    anim.loop = false;
    setTimeout(() => {
      gameRef.removeChild(anim);
    }, 145);
  });

  size = 16;
  const shotMissTextures = Array.from({ length: 5 }, (_, i) => {
    const t = new PIXI.Texture({
      source: assetLoader.getTexture('missedShot').source,
      frame: new PIXI.Rectangle(size * i, 0, size, size),
    });
    t.source.scaleMode = 'nearest';
    return t;
  });

  bus.on('shotMiss', (e) => {
    if (!oda) return;
    const anim = new PIXI.AnimatedSprite({ textures: shotMissTextures });
    anim.animationSpeed = 0.35;
    gameRef.addChild(anim);

    const randX = (Math.random() - 0.5) * 15;
    const randY = (Math.random() - 0.5) * 15;

    if (oda.isFacingRight) {
      anim.scale.x = 1;
      anim.position.set(e.area.left - 15 + randX, e.area.y + randY);
    } else {
      anim.scale.x = -1;
      anim.position.set(e.area.right + 15 + randX, e.area.y + randY);
    }

    anim.zIndex = 9999;
    anim.gotoAndPlay(0);
    anim.loop = false;
    setTimeout(() => {
      gameRef.removeChild(anim);
    }, 150);
  });

  return {
    name: () => 'gun-explosian-system',
    update: (_: number) => {},
  };
};
