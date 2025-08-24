
import * as PIXI from 'pixi.js';
import type { Position } from '../types/types';
import { Entity } from './entity';
import { ZLayer } from '../types/enums';

const spriteAnimKeys = ['idle', 'running', 'shoot'] as const;
type AnimKey = (typeof spriteAnimKeys)[number];

const spriteSheetRowDic: {
  [key in AnimKey]: {
    row: number;
    frames: number;
    animSpeed: number;
    idx: number;
  };
} = {
  idle: { row: 0, frames: 8, animSpeed: 0.025, idx: 0 },
  running: { row: 1, frames: 8, animSpeed: 0.15, idx: 0 },
  shoot: { row: 2, frames: 3, animSpeed: 0.15, idx: 0 },
};

export type AnimMapType = {
  [key in AnimKey]: PIXI.AnimatedSprite;
}

const createAnimations = (texture: PIXI.Texture): AnimMapType => {
  const result: { [key in string]: PIXI.AnimatedSprite } = {};
  for (const key of spriteAnimKeys) {
    const { frames, row, animSpeed } = spriteSheetRowDic[key];
    const width = 48;
    const height = 64;
    const textures = Array.from({ length: frames }, (_, i) => {
      const t = new PIXI.Texture({
        source: texture.source,
        frame: new PIXI.Rectangle(width * i, height * row, width, height),
      });
      t.source.scaleMode = 'nearest';
      return t;
    });

    const animatedSprite = new PIXI.AnimatedSprite({ textures });
    animatedSprite.animationSpeed = animSpeed;
    animatedSprite.visible = false;
    result[key] = animatedSprite;
  }
  return result as { [key in AnimKey]: PIXI.AnimatedSprite };
}

// -=-=-=-=-=-=-=-=-=-CLASS IMPL-=-=-=-=-=-=-=-=-=-=-

export class OdaEntity extends Entity {
  get anim(): PIXI.AnimatedSprite {
    const result = this.ctr.children.find((c) => c.visible) as PIXI.AnimatedSprite;
    return result ? result : this.animMap.idle;
  }
  animMap: { [key in AnimKey]: PIXI.AnimatedSprite };

  get hitDetectRect(): PIXI.Rectangle {
    const anim = this.anim;
    const shrinkOffset = 15;
    return new PIXI.Rectangle(
      this.ctr.x + shrinkOffset,
      this.ctr.y + anim.height * .7,
      anim.width - shrinkOffset * 2,
      anim.height - shrinkOffset * 3
    );
  }

  get moveRect(): PIXI.Rectangle {
    const anim = this.anim;
    const shrinkOffset = 15;
    return new PIXI.Rectangle(
      this.ctr.x + shrinkOffset,
      this.ctr.y + anim.height * .75,
      anim.width - shrinkOffset * 2,
      anim.height - shrinkOffset * 3.25
    );
  }

  get center(): Position {
    return {
      x: this.ctr.x + this.anim.width / 2,
      y: this.ctr.y + this.anim.height / 2,
    };
  }

  get isFacingRight(): boolean {
    return this.ctr.children[0].scale.x === 1;
  }

  get activeAnimation(): AnimKey {
    for (let i = 0; i < this.ctr.children.length; i++) {
      if (this.ctr.children[i].visible) {
        for (const [k, v] of Object.entries(spriteSheetRowDic)) {
          if (v.idx === i) {
            return k as AnimKey;
          }
        }
      }
    }
    const m = 'at least one anim must be active for shelby at all times';
    throw new Error(m);
  }


  get isRunning(): boolean {
    if (this.activeAnimation !== 'running') return false;
    return this.anim.playing;
  }

  get isShooting(): boolean {
    if (this.activeAnimation !== 'shoot') return false;
    return this.anim.playing;
  }

  constructor(props: { spriteSheet: PIXI.Texture }) {
    super(new PIXI.Container());
    this.animMap = createAnimations(props.spriteSheet);
    Object.keys(this.animMap).map((k, i) => {
      const key = k as AnimKey;
      spriteSheetRowDic[key].idx = i;
      const anim = this.animMap[key];
      this.ctr.addChild(anim);
    });
    this.ctr.children[0].visible = true;
    this.ctr.zIndex = ZLayer.m1;
  }

  setIdle() {
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.idle.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setRunning() {
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.running.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setShoot() {
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.shoot.idx].visible = true;
    this.anim.gotoAndPlay(0);
    this.anim.loop = false;
  }

  faceLeft() {
    for (const child of this.ctr.children) {
      const c = child as PIXI.AnimatedSprite;
      c.anchor.set(1, 0);
      c.scale.set(-1, 1);
    }
  }

  faceRight() {
    for (const child of this.ctr.children) {
      const c = child as PIXI.AnimatedSprite;
      c.anchor.set(0, 0);
      c.scale.set(1, 1);
    }
  }

  private _setAllAnimsInvisible() {
    for (let i = 0; i < this.ctr.children.length; i++) this.ctr.children[i].visible = false;
  }
}

