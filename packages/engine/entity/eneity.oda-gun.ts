import type * as PIXI from 'pixi.js';
import { Entity } from './entity';

export type GunName = 'rifle' | 'shotgun';

export interface IOdaGun {
  rect: PIXI.Rectangle;
  sprite: PIXI.Sprite;
  icon: PIXI.Sprite;
  name: GunName;
  ammo: number;
  range: number;
  fireRate: number;
  damage: number;
  isAutomatic: boolean;
  spread: number;
  animationSpeed: number;
}

interface gunProps2 {
  sprite: PIXI.Sprite;
  icon: PIXI.Sprite;
  name: GunName;
  ammo: number;
  fireRate: number;
  range: number;
  damage: number;
  isAutomatic: boolean;
  spread: number;
  animationSpeed: number;
}

export class OdaGunEntity extends Entity implements IOdaGun {
  icon: PIXI.Sprite;
  name: GunName;
  fireRate: number;
  ammo: number;
  range: number;
  damage: number;
  isAutomatic: boolean;
  spread: number;
  animationSpeed: number;

  get sprite(): PIXI.Sprite {
    return this.ctr as PIXI.Sprite;
  }

  constructor(props: gunProps2) {
    const sprite = props.sprite;
    super(sprite);
    this.icon = props.icon;
    this.ammo = props.ammo;
    this.fireRate = props.fireRate;
    this.range = props.range;
    this.damage = props.damage;
    this.isAutomatic = props.isAutomatic;
    this.spread = props.spread;
    this.animationSpeed = props.animationSpeed;
    this.name = props.name;
  }
}
