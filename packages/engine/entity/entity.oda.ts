import * as PIXI from 'pixi.js';
import { ZLayer } from '../types/enums';
import type { IOdaGun } from './eneity.oda-gun';
import { Entity } from './entity';

const spriteAnimKeys = ['idle', 'running', 'shoot', 'walk', 'roll'] as const;
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
  walk: { row: 3, frames: 5, animSpeed: 0.12, idx: 0 },
  roll: { row: 4, frames: 1, animSpeed: 0.0, idx: 0 },
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

export class OdaEntity extends Entity {
  gunList: IOdaGun[] = [];

  get gun(): IOdaGun {
    const activeGun = this.gunList.at(0);
    if (!activeGun) throw new Error('no active gun');
    return activeGun;
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
      this.ctr.x + shrinkOffset,
      this.ctr.y + anim.height * 0.75,
      anim.width - shrinkOffset * 2,
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
    const m = 'at least one anim must be active for shelby at all times';
    throw new Error(m);
  }

  get isRunning(): boolean {
    if (this.activeAnimation !== 'running') return false;
    return this.anim.playing;
  }

  get isIdle(): boolean {
    if (this.activeAnimation !== 'idle') return false;
    return this.anim.playing;
  }

  get isShooting(): boolean {
    if (this.activeAnimation !== 'shoot') return false;
    return this.anim.playing;
  }

  get isWalking(): boolean {
    if (this.activeAnimation !== 'walk') return false;
    return this.anim.playing;
  }

  get isRolling(): boolean {
    if (this.activeAnimation !== 'roll') return false;
    return this.anim.playing;
  }

  constructor(props: { spriteSheet: PIXI.Texture }) {
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

  setIdle() {
    this.setGunVisible(true);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.idle.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setRunning() {
    this.setGunVisible(true);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.running.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setWalking() {
    this.setGunVisible(true);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.walk.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setShoot() {
    this.setGunVisible(true);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.shoot.idx].visible = true;
    this.anim.gotoAndPlay(0);
    this.anim.loop = false;
  }

  setRolling() {
    this.setGunVisible(false);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.roll.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  faceLeft() {
    for (const child of this.ctr.children) {
      const c = child as PIXI.AnimatedSprite;
      c.anchor.set(1, 0);
      c.scale.set(-1, 1);
    }

    if (this.gun) {
      const gun = this.gun.sprite;
      gun.anchor.set(0.24, 0);
      gun.scale.set(-1, 1);
    }
  }

  faceRight() {
    for (const child of this.ctr.children) {
      const c = child as PIXI.AnimatedSprite;
      c.anchor.set(0, 0);
      c.scale.set(1, 1);
    }

    if (this.gun) {
      const gun = this.gun.sprite;
      gun.anchor.set(0, 0);
      gun.scale.set(1, 1);
    }
  }

  setGunVisible(value: boolean) {
    this.gun.sprite.visible = value;
  }

  move(amount: PIXI.Point) {
    this.ctr.x += amount.x;
    this.ctr.y += amount.y;
    if (this.gun) {
      this.gun.sprite.x = this.ctr.x + 20;
      this.gun.sprite.y = this.ctr.y + 28;
    }
  }

  private _setAllAnimsInvisible() {
    for (let i = 0; i < this.ctr.children.length; i++) this.ctr.children[i].visible = false;
  }
}
