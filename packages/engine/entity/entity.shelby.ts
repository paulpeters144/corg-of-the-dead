import * as PIXI from 'pixi.js';
import type { Position } from '../types/types';
import { Entity } from './entity';

const spriteAnimKeys = ['running', 'stationary', 'standShoot', 'walkShoot'] as const;
type AnimKey = (typeof spriteAnimKeys)[number];

const spriteSheetRowDic: {
  [key in AnimKey]: {
    row: number;
    frames: number;
    animSpeed: number;
    idx: number;
  };
} = {
  running: { row: 0, frames: 5, animSpeed: 0.12, idx: 0 },
  stationary: { row: 1, frames: 3, animSpeed: 0.085, idx: 0 },
  standShoot: { row: 2, frames: 5, animSpeed: 0.12, idx: 0 },
  walkShoot: { row: 3, frames: 5, animSpeed: 0.12, idx: 0 },
};

export class ShelbyModel extends Entity {
  get anim(): PIXI.AnimatedSprite {
    const result = this.ctr.children.find((c) => c.visible) as PIXI.AnimatedSprite;
    return result ? result : this.animMap.stationary;
  }
  animMap: { [key in AnimKey]: PIXI.AnimatedSprite };

  get rect(): PIXI.Rectangle {
    const anim = this.anim;
    return new PIXI.Rectangle(this.ctr.x, this.ctr.y, anim.width, anim.height);
  }

  get center(): Position {
    return {
      x: this.ctr.x + this.anim.width / 2,
      y: this.ctr.y + this.anim.height / 2,
    };
  }

  isJumping = false;
  isOnGround = false;
  lastFellAt = performance.now();

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
    const shootingStill = this.activeAnimation === 'standShoot';
    const shootingMove = this.activeAnimation === 'walkShoot';
    if (!shootingStill && !shootingMove) return false;
    return this.anim.playing;
  }

  get isDucking(): boolean {
    if (this.activeAnimation !== 'stationary') return false;
    return this.anim.currentFrame === 2;
  }

  constructor(props: { spriteSheet: PIXI.Texture }) {
    super(new PIXI.Container());
    this.animMap = this._createAnimations(props.spriteSheet);

    const animKeys = Object.keys(this.animMap);
    for (let i = 0; i < animKeys.length; i++) {
      const animKey = animKeys[i];
      const anim = this.animMap[animKey as AnimKey];
      spriteSheetRowDic[animKey as AnimKey].idx = i;
      this.ctr.addChild(anim);
    }

    this.ctr.children[0].visible = true;
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

  setStanding() {
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.stationary.idx].visible = true;
    this.anim.currentFrame = 0;
    this.anim.stop();
  }

  lastJump = performance.now();
  setJumping() {
    this.lastJump = performance.now();
    this.setStanding();
    this.anim.currentFrame = 1;
  }

  setRunning() {
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.running.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  standShoot() {
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.standShoot.idx].visible = true;
    this.anim.gotoAndPlay(0);
    this.anim.loop = false;
  }

  moveShoot() {
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.walkShoot.idx].visible = true;
    this.anim.gotoAndPlay(0);
    this.anim.loop = false;
  }

  setDucking() {
    this.setStanding();
    this.anim.currentFrame = 2;
  }

  setRunSpeed(val: 'fast' | 'slow') {
    if (this.activeAnimation !== 'running') return;
    if (val === 'fast') {
      this.anim.animationSpeed = spriteSheetRowDic.running.animSpeed * 1.35;
    }
    if (val === 'slow') {
      this.anim.animationSpeed = spriteSheetRowDic.running.animSpeed;
    }
  }

  private _createAnimations(texture: PIXI.Texture): {
    [key in AnimKey]: PIXI.AnimatedSprite;
  } {
    const result: { [key in string]: PIXI.AnimatedSprite } = {};
    for (const key of spriteAnimKeys) {
      const { frames, row, animSpeed } = spriteSheetRowDic[key];
      const size = 32;
      const textures = Array.from({ length: frames }, (_, i) => {
        const t = new PIXI.Texture({
          source: texture.source,
          frame: new PIXI.Rectangle(size * i, size * row * 1.5, size, size),
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

  private _setAllAnimsInvisible() {
    for (let i = 0; i < this.ctr.children.length; i++) this.ctr.children[i].visible = false;
  }
}
