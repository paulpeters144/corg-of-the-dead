import type * as PIXI from 'pixi.js';
import { Entity } from './entity';

export type GunName = 'Rifle' | 'Shotgun';

type assets = {
  flash: PIXI.Texture;
  icon: PIXI.Texture;
  impact: PIXI.Texture;
};

export interface IOdaGun {
  rect: PIXI.Rectangle;
  sprite: PIXI.Sprite;
  assets: assets;
  name: GunName;
  ammo: number;
  range: number;
  fireRate: number;
  damage: number;
  isAutomatic: boolean;
  spread: number;
  animationSpeed: number;
}

interface gunProps {
  sprite: PIXI.Sprite;
  assets: assets;
  name: GunName;
  ammo: number;
  fireRate: number;
  range: number;
  damage: number;
  isAutomatic: boolean;
  spread: number;
  animationSpeed: number;
  areaSize: number;
}

export class OdaGunEntity extends Entity implements IOdaGun {
  name: GunName;
  fireRate: number;
  ammo: number;
  range: number;
  damage: number;
  isAutomatic: boolean;
  spread: number;
  animationSpeed: number;
  assets: assets;
  areaSize: number;

  get sprite(): PIXI.Sprite {
    return this.ctr as PIXI.Sprite;
  }

  constructor(props: gunProps) {
    const sprite = props.sprite;
    super(sprite);
    this.ammo = props.ammo;
    this.fireRate = props.fireRate;
    this.range = props.range;
    this.damage = props.damage;
    this.isAutomatic = props.isAutomatic;
    this.spread = props.spread;
    this.animationSpeed = props.animationSpeed;
    this.name = props.name;
    this.assets = props.assets;
    this.areaSize = props.areaSize;
  }
}
