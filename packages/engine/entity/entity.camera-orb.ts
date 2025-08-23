import * as PIXI from 'pixi.js';
import { Entity } from './entity';

export class CameraOrbEntity extends Entity {
  constructor() {
    const graphic = new PIXI.Graphics()
      .rect(0, 0, 3, 3)
      .fill({ color: '#0cec3dff' })
      .stroke({ width: 1, color: '#ffffffff' });
    graphic.pivot.x = graphic.width / 2;
    graphic.pivot.y = graphic.height / 2;
    super(graphic);
    // this.ctr.visible = false;
  }
}
