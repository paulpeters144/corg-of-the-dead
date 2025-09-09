import type * as PIXI from 'pixi.js';
import { Entity } from './entity';

export type PollName = 'ParkSign' | 'SomeOtherName';

type assets = {
  flash: PIXI.Texture;
  icon: PIXI.Texture;
  impact: PIXI.Texture;
};

export interface IOdaPoll {
  anim: PIXI.AnimatedSprite;
  assets: assets;
  name: PollName;
  health: number;
  hitRate: number;
  damage: number;
}

interface gunProps {
  anim: PIXI.AnimatedSprite;
  assets: assets;
  name: PollName;
  health: number;
  hitRate: number;
  damage: number;
}

export class OdaPollEntity extends Entity implements IOdaPoll {
  assets: assets;
  name: PollName;
  health: number;
  hitRate: number;
  damage: number;

  get anim(): PIXI.AnimatedSprite {
    return this.ctr as PIXI.AnimatedSprite;
  }

  constructor(props: gunProps) {
    const anim = props.anim;
    super(anim);
    this.assets = props.assets;
    this.name = props.name;
    this.health = props.health;
    this.hitRate = props.hitRate;
    this.damage = props.damage;
  }
}
