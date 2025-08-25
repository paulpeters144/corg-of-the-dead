
import * as PIXI from 'pixi.js';
import { Entity } from './entity';

export interface IOdaGun {
  sprite: PIXI.Sprite;
  ammo: number;
  fireRate: number;
  damage: number;
  isAutomatic: boolean;
  spread: number;
  animationSpeed: number;
}

export class OdaFirstGunEntity extends Entity implements IOdaGun {
  ammo = 100;
  fireRate = 50;
  damage = 10;
  isAutomatic = false;
  spread = 1;
  animationSpeed = 0.18;

  get sprite(): PIXI.Sprite {
    return this.ctr as PIXI.Sprite;
  }

  constructor(props: { texture: PIXI.Texture }) {
    const sprite = new PIXI.Sprite(props.texture);
    super(sprite);
  }
}

export class OdaShotgunEntity extends Entity implements IOdaGun {
  ammo = 8;
  fireRate = 50;
  damage = 25;
  isAutomatic = false;
  spread = 5;
  animationSpeed = 0.15;

  get sprite(): PIXI.Sprite {
    return this.ctr as PIXI.Sprite;
  }

  constructor(props: { texture: PIXI.Texture }) {
    const sprite = new PIXI.Sprite(props.texture);
    super(sprite);
  }
}
