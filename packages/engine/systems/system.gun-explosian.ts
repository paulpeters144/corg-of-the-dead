import * as PIXI from 'pixi.js';
import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createGunExplosianSystem = (di: IDiContainer): ISystem => {
  const bus = di.eventBus();
  const gameRef = di.gameRef();
  const oda = di.entityStore().first(OdaEntity);

  if (!oda?.gun) throw new Error('oda gun not found');

  const texture = oda.gun.assets.impact;

  const size = 32;
  const textures = Array.from({ length: 5 }, (_, i) => {
    const t = new PIXI.Texture({
      source: texture.source,
      frame: new PIXI.Rectangle(size * i, 0, size, size),
    });
    t.source.scaleMode = 'nearest';
    return t;
  });

  bus.on('shotHit', (e) => {
    if (!oda) return;
    const anim = new PIXI.AnimatedSprite({ textures });
    anim.animationSpeed = 0.35;
    gameRef.addChild(anim);
    anim.position.set(oda.isFacingRight ? e.area.left - 15 : e.area.right - 15, e.area.y);
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
