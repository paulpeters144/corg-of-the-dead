import * as PIXI from 'pixi.js';
export class Entity {
  public readonly id: string;
  public readonly ctr: PIXI.Container;
  public get rect(): PIXI.Rectangle {
    return new PIXI.Rectangle(this.ctr.x, this.ctr.y, this.ctr.width, this.ctr.height);
  }

  constructor(ctr: PIXI.Container) {
    this.ctr = ctr;
    this.id = crypto.randomUUID().replaceAll('-', '').slice(0, 15);
  }
}
