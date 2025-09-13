import * as PIXI from 'pixi.js';
import { ZLayer } from '../types/enums';
import { Entity } from './entity';

const spriteAnimKeys = [
  'idle',
  'walk',
  'swipe',
  'die',
  'hitDirection',
  'fall',
  'revive',
] as const;

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

  isActiveAnim(key: AnimKey) {
    if (this.activeAnimation !== key) return false;
    if (!this.anim.playing) return false;
    return true;
  }

  private _setAllAnimsInvisible() {
    for (let i = 0; i < this.ctr.children.length; i++) {
      this.ctr.children[i].visible = false;
    }
  }
}
