import * as PIXI from 'pixi.js';
import { Entity } from './entity';

export class ShotFlash extends Entity {
  get anim(): PIXI.AnimatedSprite {
    return this.ctr as PIXI.AnimatedSprite;
  }

  constructor(props: { texture: PIXI.Texture }) {
    const { texture } = props;

    const frames = 2;
    const row = 0;
    const animSpeed = 0.01;
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
    super(animatedSprite);
    this.ctr.visible = false;
  }

  faceLeft() {
    this.anim.anchor.set(1, 0);
    this.anim.scale.set(-1, 1);
  }

  faceRight() {
    this.anim.anchor.set(0, 0);
    this.anim.scale.set(1, 1);
  }
}
