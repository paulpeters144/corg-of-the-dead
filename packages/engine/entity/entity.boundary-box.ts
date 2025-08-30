import * as PIXI from 'pixi.js';
import { Entity } from './entity';

export class BoundaryBox extends Entity {
  public data = '';
  public get rect(): PIXI.Rectangle {
    return new PIXI.Rectangle(this.ctr.x, this.ctr.y, this.ctr.width, this.ctr.height);
  }
  public get center(): PIXI.Point {
    return new PIXI.Point(
      this.ctr.x + this.ctr.width,
      this.ctr.y + this.ctr.height,
    );
  }

  constructor(props: { rect: PIXI.Rectangle }) {
    const { rect } = props;
    const graphic = new PIXI.Graphics().rect(0, 0, rect.width, rect.height).fill({ color: 'black' });
    graphic.visible = false;
    super(graphic);
    this.ctr.x = rect.x;
    this.ctr.y = rect.y;
  }
}
