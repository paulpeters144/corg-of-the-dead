import * as PIXI from 'pixi.js';
import { Entity } from '../entity/entity';
import { ZLayer } from '../types/enums';
import type { IBtnState } from '../util/control/button-state';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

const createAnimatedSprite = (props: { texture: PIXI.Texture; size: number; frames: number }) => {
  const { texture, size, frames } = props;
  const textures = Array.from({ length: frames }, (_, i) => {
    const t = new PIXI.Texture({
      source: texture.source,
      frame: new PIXI.Rectangle(size * i, 0, size, size),
    });
    t.source.scaleMode = 'nearest';
    return t;
  });
  return new PIXI.AnimatedSprite({ textures });
};

class InputEntity extends Entity {
  btn: PIXI.AnimatedSprite;

  text = new PIXI.Text({
    style: new PIXI.TextStyle({
      fontFamily: 'pix',
      fontSize: 10,
      fontWeight: 'bold',
      fill: { color: 'white' },
    }),
  });

  get isPressed(): boolean {
    return this.btn.currentFrame === 1;
  }

  constructor(props: { texture: PIXI.Texture; character: string }) {
    const ctr = new PIXI.Container();

    super(ctr);

    this.text.text = props.character;
    const { texture } = props;
    this.btn = createAnimatedSprite({
      texture: texture,
      size: 32,
      frames: 2,
    });
    ctr.zIndex = ZLayer.t1;
    ctr.addChild(this.btn, this.text);
    this.text.resolution = 3;
    this.setReleased();
  }

  setPressed() {
    this.text.x = this.btn.x + 1.5 + (this.btn.width - this.text.width) / 2;
    this.text.y = this.btn.y + (this.btn.height - this.text.height) / 2.25;
    this.ctr.alpha = 0.85;
    this.btn.currentFrame = 1;
  }

  setReleased() {
    this.text.x = this.btn.x + 1.5 + (this.btn.width - this.text.width) / 1.85;
    this.text.y = this.btn.y + (this.btn.height - this.text.height) / 2.75;
    this.ctr.alpha = 0.5;
    this.btn.currentFrame = 0;
  }
}

export const createInputUISystem = (di: IDiContainer): ISystem => {
  const input = di.input();
  const camera = di.camera();
  const assetLoader = di.assetLoader();
  const gameRef = di.gameRef();
  const texture = assetLoader.getTexture('inputBtn');

  const inputEntities = [
    new InputEntity({ texture, character: '⇧' }), // up
    new InputEntity({ texture, character: '⇨' }), // right
    new InputEntity({ texture, character: '⇩' }), // down
    new InputEntity({ texture, character: '⇦' }), // left
    new InputEntity({ texture, character: 'C' }),
    new InputEntity({ texture, character: 'X' }),
  ];

  const getInputEntity = (c: 'up' | 'rt' | 'dn' | 'lt' | string) => {
    let result: InputEntity | undefined;

    if (c === 'up') result = inputEntities.find((e) => e.text.text === '⇧');
    else if (c === 'rt') result = inputEntities.find((e) => e.text.text === '⇨');
    else if (c === 'dn') result = inputEntities.find((e) => e.text.text === '⇩');
    else if (c === 'lt') result = inputEntities.find((e) => e.text.text === '⇦');
    else result = inputEntities.find((e) => e.text.text === c);

    return result;
  };

  const rtInput = getInputEntity('rt');
  const upInput = getInputEntity('up');
  const ltInput = getInputEntity('lt');
  const dnInput = getInputEntity('dn');

  const shootInput = getInputEntity('C');
  const walkInput = getInputEntity('X');

  if (!rtInput) throw new Error('rt');
  if (!upInput) throw new Error('up');
  if (!ltInput) throw new Error('lt');
  if (!dnInput) throw new Error('dn');

  if (!shootInput) throw new Error('C');
  if (!walkInput) throw new Error('X');

  const actionBtnCtr = new PIXI.Container();
  actionBtnCtr.zIndex = ZLayer.t1;
  actionBtnCtr.addChild(shootInput.ctr, walkInput.ctr);

  walkInput.ctr.x = 0;
  shootInput.ctr.x = 23;

  const directionCtr = new PIXI.Container();
  directionCtr.zIndex = ZLayer.t1;
  directionCtr.addChild(rtInput.ctr, ltInput.ctr, upInput.ctr, dnInput.ctr);

  gameRef.addChild(directionCtr, actionBtnCtr);

  upInput.ctr.y -= 24;

  ltInput.ctr.x -= 22;
  ltInput.ctr.y -= 10;

  rtInput.ctr.x += 22;
  rtInput.ctr.y -= 10;

  const hanldePressInput = (props: { btnState: IBtnState; inputEntity: InputEntity }) => {
    const { btnState, inputEntity } = props;
    if (btnState.is.pressed && !inputEntity.isPressed) {
      inputEntity.setPressed();
    } else if (!btnState.is.pressed && inputEntity.isPressed) {
      inputEntity.setReleased();
    }
  };

  return {
    name: () => 'input-ui-system',
    update: (_: number) => {
      const camZeroPos = camera.zeroPos();

      directionCtr.position.set(camZeroPos.x + camera.vpBounds().width - 20, camZeroPos.y + camera.vpBounds().height);

      actionBtnCtr.position.set(camZeroPos.x + 15, camZeroPos.y + camera.vpBounds().height);

      hanldePressInput({ btnState: input.up, inputEntity: upInput });
      hanldePressInput({ btnState: input.down, inputEntity: dnInput });
      hanldePressInput({ btnState: input.right, inputEntity: rtInput });
      hanldePressInput({ btnState: input.left, inputEntity: ltInput });

      hanldePressInput({ btnState: input.shoot, inputEntity: shootInput });
      hanldePressInput({ btnState: input.walk, inputEntity: walkInput });
    },
  };
};
