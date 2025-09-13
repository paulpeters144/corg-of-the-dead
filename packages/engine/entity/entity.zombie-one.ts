import * as PIXI from 'pixi.js';
import { ZLayer } from '../types/enums';
import { Entity } from './entity';
import { ColorOverlayFilter } from 'pixi-filters';

const spriteAnimKeys = ['idle', 'walk', 'swipe', 'die', 'hitDirection', 'fall', 'revive'] as const;

type AnimKey = (typeof spriteAnimKeys)[number];

const spriteSheetRowDic: {
  [key in AnimKey]: {
    row: number;
    frames: number;
    animSpeed: number;
    idx: number;
  };
} = {
  idle: { row: 0, frames: 5, animSpeed: 0.035, idx: 0 },
  walk: { row: 1, frames: 5, animSpeed: 0.1, idx: 0 },
  swipe: { row: 2, frames: 5, animSpeed: 0.1, idx: 0 },
  die: { row: 3, frames: 4, animSpeed: 0.075, idx: 0 },
  hitDirection: { row: 4, frames: 2, animSpeed: 0.0, idx: 0 },
  fall: { row: 5, frames: 5, animSpeed: 0.1, idx: 0 },
  revive: { row: 6, frames: 5, animSpeed: 0.1, idx: 0 },
};

export type AnimMapType = {
  [key in AnimKey]: PIXI.AnimatedSprite;
};

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
};

// -=-=-=-=-=-=-=-=-=-CLASS IMPL-=-=-=-=-=-=-=-=-=-=-

export class ZombieOneEntity extends Entity {
  private _health = 100;
  get health(): number {
    return this._health;
  }

  animMap: { [key in AnimKey]: PIXI.AnimatedSprite };

  get anim(): PIXI.AnimatedSprite {
    const result = this.ctr.children.find((c) => c.visible) as PIXI.AnimatedSprite;
    return result ? result : this.animMap.idle;
  }

  get hitDetectRect(): PIXI.Rectangle {
    const anim = this.anim;
    const shrinkOffset = 15;
    return new PIXI.Rectangle(
      this.ctr.x + shrinkOffset,
      this.ctr.y + anim.height * 0.7,
      anim.width - shrinkOffset * 2,
      anim.height - shrinkOffset * 3,
    );
  }

  get moveRect(): PIXI.Rectangle {
    const anim = this.anim;
    const shrinkOffset = 15;
    return new PIXI.Rectangle(
      this.ctr.x + shrinkOffset * 0.001,
      this.ctr.y + anim.height * 0.75,
      anim.width - shrinkOffset * 0.25,
      anim.height - shrinkOffset * 3.25,
    );
  }

  get hasFilter(): boolean {
    if (!this.ctr.filters) return false;
    if (this.ctr.filters.length === 0) return false;
    return true;
  }

  get center(): PIXI.Point {
    return new PIXI.Point(this.ctr.x + this.anim.width / 2, this.ctr.y + this.anim.height / 2);
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
    const m = 'at least one anim must be active for ZombieOneEntity at all times';
    throw new Error(m);
  }

  get onLastFrame(): boolean {
    const current = this.anim.currentFrame + 1;
    const total = this.anim.totalFrames;
    return current === total;
  }

  constructor(props: {
    spriteSheet: PIXI.Texture;
  }) {
    super(new PIXI.Container());
    this.animMap = createAnimations(props.spriteSheet);

    const keysMap = Object.keys(this.animMap);
    for (let i = 0; i < keysMap.length; i++) {
      const k = keysMap[i];
      const key = k as AnimKey;
      spriteSheetRowDic[key].idx = i;
      const anim = this.animMap[key];
      this.ctr.addChild(anim);
    }

    this.ctr.children[0].visible = true;
    this.ctr.zIndex = ZLayer.m1;
  }

  setAnimation(key: AnimKey) {
    this._setAllAnimsInvisible();
    const { idx } = spriteSheetRowDic[key];
    this.ctr.children[idx].visible = true;
    this.anim.gotoAndPlay(0);
    switch (key) {
      case 'swipe':
      case 'fall':
      case 'revive':
      case 'die':
        this.anim.loop = false;
        break;
      default:
        this.anim.loop = true;
        break;
    }
  }

  setIdleGun() {
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.idle.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  faceLeft() {
    for (const child of this.ctr.children) {
      const c = child as PIXI.AnimatedSprite;
      c.anchor.set(0, 0);
      c.scale.set(1, 1);
    }
  }

  faceRight() {
    for (const child of this.ctr.children) {
      const c = child as PIXI.AnimatedSprite;
      c.anchor.set(1, 0);
      c.scale.set(-1, 1);
    }
  }

  isActiveAnim(...keys: AnimKey[]) {
    const active = this.activeAnimation;
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === active) return true;
    }
    return false;
  }

  setRedFilter() {
    const redOverlay = new ColorOverlayFilter({
      color: '#ff0000',
      alpha: 1
    });
    this.ctr.filters = [redOverlay];
  }

  recieveDamage(value: number) {
    this._health -= value;
    if (this._health < 0) {
      this._health = 0;
    }
  }

  private _setAllAnimsInvisible() {
    for (let i = 0; i < this.ctr.children.length; i++) {
      this.ctr.children[i].visible = false;
    }
  }
}
