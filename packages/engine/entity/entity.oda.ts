import * as PIXI from 'pixi.js';
import { ZLayer } from '../types/enums';
import { Entity } from './entity';
import type { GunName, IOdaGun } from './entity.oda-gun';
import type { IOdaPoll, PollName } from './entity.oda-poll';

const spriteAnimKeys = [
  'gunIdle',
  'gunRun',
  'gunShoot',
  'gunWalk',
  'roll',
  'pollIdle',
  'pollSwing',
  'pollRun',
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
  gunIdle: { row: 0, frames: 8, animSpeed: 0.03, idx: 0 },
  gunRun: { row: 1, frames: 8, animSpeed: 0.15, idx: 0 },
  gunShoot: { row: 2, frames: 3, animSpeed: 0.15, idx: 0 },
  gunWalk: { row: 3, frames: 5, animSpeed: 0.12, idx: 0 },
  roll: { row: 4, frames: 1, animSpeed: 0.0, idx: 0 },
  pollIdle: { row: 5, frames: 8, animSpeed: 0.03, idx: 0 },
  pollSwing: { row: 6, frames: 3, animSpeed: 0.15, idx: 0 },
  pollRun: { row: 7, frames: 8, animSpeed: 0.15, idx: 0 },
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
  pollList: IOdaPoll[];
  gunList: IOdaGun[] = [];

  weaponCtr = new PIXI.Container();

  get poll(): IOdaPoll {
    const activePoll = this.pollList.at(0);
    if (!activePoll) throw new Error('no active gun');
    return activePoll;
  }

  get gun(): IOdaGun {
    const activeGun = this.gunList.at(0);
    if (!activeGun) throw new Error('no active gun');
    return activeGun;
  }

  animMap: { [key in AnimKey]: PIXI.AnimatedSprite };

  get anim(): PIXI.AnimatedSprite {
    const result = this.ctr.children.find((c) => c.visible) as PIXI.AnimatedSprite;
    return result ? result : this.animMap.gunIdle;
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
    if (!this.anim.playing) return false;
    return this.activeAnimation.endsWith('Run');
  }

  get isIdle(): boolean {
    if (!this.anim.playing) return false;
    return this.activeAnimation.endsWith('Idle');
  }

  get isShooting(): boolean {
    if (this.activeAnimation !== 'gunShoot') return false;
    return this.anim.playing;
  }

  get isWalking(): boolean {
    if (this.activeAnimation !== 'gunWalk') return false;
    return this.anim.playing;
  }

  get isRolling(): boolean {
    if (this.activeAnimation !== 'roll') return false;
    return this.anim.playing;
  }

  get usingGun(): boolean {
    return this.activeAnimation.startsWith('gun');
  }

  get usingPoll(): boolean {
    return this.activeAnimation.startsWith('poll');
  }

  constructor(props: {
    spriteSheet: PIXI.Texture;
    gunList: IOdaGun[];
    pollList: IOdaPoll[];
  }) {
    super(new PIXI.Container());
    this.pollList = props.pollList;
    this.gunList = props.gunList;
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
    this.setActiveWeapon({ type: 'poll', name: 'ParkSign' });
    this.ctr.zIndex = ZLayer.m1;
  }

  setIdleGun() {
    this.setWeaponVisible(true);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.gunIdle.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setGunRun() {
    this.setWeaponVisible(true);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.gunRun.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setGunWalk() {
    this.setWeaponVisible(true);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.gunWalk.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setShoot() {
    this.setWeaponVisible(true);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.gunShoot.idx].visible = true;
    this.anim.gotoAndPlay(0);
    this.anim.loop = false;
  }

  setRolling() {
    this.setWeaponVisible(false);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.roll.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setPollSwing() {
    this.setWeaponVisible(false);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.pollSwing.idx].visible = true;
    this.anim.gotoAndPlay(0);
    this.anim.loop = false;
  }

  setIdlePoll() {
    this.setWeaponVisible(false);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.pollIdle.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  setPollRun() {
    this.setWeaponVisible(false);
    this._setAllAnimsInvisible();
    this.ctr.children[spriteSheetRowDic.pollRun.idx].visible = true;
    this.anim.gotoAndPlay(0);
  }

  faceLeft() {
    for (const child of this.ctr.children) {
      const c = child as PIXI.AnimatedSprite;
      c.anchor.set(1, 0);
      c.scale.set(-1, 1);
    }

    this.gun.sprite.anchor.set(0.25, 0);
    this.gun.sprite.scale.set(-1, 1);
    this.poll.anim.anchor.set(0.25, 0);
    this.poll.anim.scale.set(-1, 1);
  }

  faceRight() {
    for (const child of this.ctr.children) {
      const c = child as PIXI.AnimatedSprite;
      c.anchor.set(0, 0);
      c.scale.set(1, 1);
    }

    this.gun.sprite.anchor.set(0, 0);
    this.gun.sprite.scale.set(1, 1);
    this.poll.anim.anchor.set(0, 0);
    this.poll.anim.scale.set(1, 1);
  }

  setWeaponVisible(value: boolean) {
    this.gun.sprite.visible = value;
    this.poll.anim.visible = value;
  }

  setActiveWeapon(
    props:
      | {
        type: 'gun';
        name: GunName;
      }
      | {
        type: 'poll';
        name: PollName;
      },
  ) {
    if (props.type === 'gun') {
      const gunName = props.name;
      const originalCount = this.gunList.length;
      this.weaponCtr.removeChildren();
      const activeGun = this.gunList.find((g) => g.name === gunName);
      if (!activeGun) throw new Error(`gun name not found in gunList: ${gunName}`);
      const nonAcivtGuns = this.gunList.filter((g) => g.name !== gunName).sort();
      const proposedNewGunList = [activeGun, ...nonAcivtGuns].filter((g) => !!g);
      if (originalCount !== proposedNewGunList.length) throw new Error('count is off');
      this.gunList = proposedNewGunList;
      this.weaponCtr.zIndex = ZLayer.m2;
      this.weaponCtr.addChild(this.gun.sprite);
      this.move(new PIXI.Point(0, 0));
      this.setIdleGun();
    }

    if (props.type === 'poll') {
      const pollName = props.name;
      const originalCount = this.pollList.length;
      this.weaponCtr.removeChildren();
      const activePoll = this.pollList.find((p) => p.name === props.name);
      if (!activePoll) throw new Error(`poll name not found in pollList: ${pollName}`);
      const nonAcivePolls = this.pollList.filter((p) => p.name !== pollName).sort();
      const proposedNewPollList = [activePoll, ...nonAcivePolls].filter((g) => !!g);
      if (originalCount !== proposedNewPollList.length) throw new Error('count is off');
      this.pollList = proposedNewPollList;
      this.weaponCtr.zIndex = ZLayer.m2;
      this.weaponCtr.addChild(this.poll.anim);
      this.move(new PIXI.Point(0, 0));
      this.setIdlePoll();
    }

    this.isFacingRight ? this.faceRight() : this.faceLeft();
  }

  move(amount: PIXI.Point) {
    this.ctr.x += amount.x;
    this.ctr.y += amount.y;
    if (this.gun) {
      if (this.isFacingRight) {
        this.gun.sprite.x = this.ctr.x + 25;
      } else {
        this.gun.sprite.x = this.ctr.x + 18;
      }
      this.gun.sprite.y = this.ctr.y + 16;
    }
  }

  isActiveAnim(key: AnimKey) {
    if (this.activeAnimation !== key) return false;
    if (!this.anim.playing) return false;
    return true;
  }

  private _setAllAnimsInvisible() {
    for (let i = 0; i < this.ctr.children.length; i++) this.ctr.children[i].visible = false;
  }
}
