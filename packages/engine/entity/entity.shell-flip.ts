import * as PIXI from 'pixi.js';
import type { Position } from '../types/types';
import { Entity } from './entity';

export class ShellFlip extends Entity {
  spawnPos: Position = { x: 0, y: 0 };
  readonly createdAt = performance.now();
  get rect(): PIXI.Rectangle {
    return new PIXI.Rectangle(this.ctr.x + 8, this.ctr.y + 5, this.ctr.width - 10, this.ctr.height - 10);
  }

  get anim(): PIXI.AnimatedSprite {
    return this.ctr as PIXI.AnimatedSprite;
  }

  constructor(props: { texture: PIXI.Texture }) {
    const { texture } = props;

    const frames = 5;
    const row = 0;
    const animSpeed = 0.25;
    const size = 16;
    const textures = Array.from({ length: frames }, (_, i) => {
      const t = new PIXI.Texture({
        source: texture.source,
        frame: new PIXI.Rectangle(size * i, size * row, size, size),
      });
      t.source.scaleMode = 'nearest';
      return t;
    });
    const animatedSprite = new PIXI.AnimatedSprite({ textures });
    animatedSprite.animationSpeed = animSpeed;
    animatedSprite.loop = false;
    super(animatedSprite);
  }

  faceLeft() {
    this.anim.scale.set(-1, 1);
  }

  faceRight() {
    this.anim.scale.set(1, 1);
  }

  setSpawnPoints(props: { pos: Position; facingRight: boolean }) {
    const { pos, facingRight } = props;
    this.spawnPos = pos;

    if (facingRight) {
      this.anim.scale.set(-1, 1);
      this.ctr.position.set(pos.x + 15, pos.y);
    } else {
      this.anim.scale.set(1, 1);
      this.ctr.position.set(pos.x + 3, pos.y);
    }
  }
}
