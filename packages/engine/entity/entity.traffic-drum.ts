
import * as PIXI from 'pixi.js';
import type { Position } from '../types/types';
import { Entity } from './entity';
import { ZLayer } from '../types/enums';

const spriteAnimKeys = ['idle'] as const;
type AnimKey = (typeof spriteAnimKeys)[number];

const spriteSheetRowDic: {
  [key in AnimKey]: {
    row: number;
    frames: number;
    animSpeed: number;
    idx: number;
  };
} = {
  idle: { row: 0, frames: 5, animSpeed: 0, idx: 0 },
};

export type AnimMapType = {
  [key in AnimKey]: PIXI.AnimatedSprite;
}

const createAnimations = (texture: PIXI.Texture): AnimMapType => {
  const result: { [key in string]: PIXI.AnimatedSprite } = {};
  for (const key of spriteAnimKeys) {
    const { frames, row, animSpeed } = spriteSheetRowDic[key];
    const width = 32;
    const height = 40;
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
    animatedSprite.zIndex = -1;
    result[key] = animatedSprite;
  }
  return result as { [key in AnimKey]: PIXI.AnimatedSprite };
}

// -=-=-=-=-=-=-=-=-=-CLASS IMPL-=-=-=-=-=-=-=-=-=-=-

export class TrafficDrumEntity extends Entity {
  animMap: { [key in AnimKey]: PIXI.AnimatedSprite };

  get anim(): PIXI.AnimatedSprite {
    const result = this.ctr.children.find((c) => c.visible) as PIXI.AnimatedSprite;
    return result ? result : this.animMap.idle;
  }

  get rect(): PIXI.Rectangle {
    const anim = this.anim;
    const xBuffer = 5;
    const yBuffer = 25;
    return new PIXI.Rectangle(
      this.ctr.x + (xBuffer * .6),
      this.ctr.y + yBuffer,
      anim.width - xBuffer,
      anim.height - yBuffer)
  }

  get center(): Position {
    return {
      x: this.ctr.x + this.anim.width / 2,
      y: this.ctr.y + this.anim.height / 2,
    };
  }

  private _health: number = 100;
  get health(): number {
    return this._health;
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

  recieveDamage(val: number): boolean {
    this._health -= val;
    if (this._health < 0) {
      this._health = 0;
    }
    if (this._health <= 82) {
    } else if (this._health <= 64) {
      this.anim.gotoAndStop(1)
    } else if (this._health <= 46) {
      this.anim.gotoAndStop(2)
    } else if (this._health <= 28) {
      this.anim.gotoAndStop(3)
    } else if (this._health <= 10) {
      this.anim.gotoAndStop(4)
    } else {
      this.anim.gotoAndStop(0)
    }
    const died = this._health <= 0;
    return died
  }
}

