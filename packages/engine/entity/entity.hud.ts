import * as PIXI from 'pixi.js';
import { ZLayer } from '../types/enums';
import { Entity } from './entity';

interface HudProps {
  odaIcon: PIXI.Sprite;
  weaponIcon: PIXI.Sprite;
}

export class HeadsUpDisplayEntity extends Entity {
  maxHealthBarWidth = 150;
  maxHealthGraphic: PIXI.Graphics;
  headBarMainGraphic: PIXI.Graphics;
  odaIcon: PIXI.Sprite;
  weaponIcon: PIXI.Sprite;
  weaponIconBgGraphic: PIXI.Graphics;
  ammoText: PIXI.Text;

  constructor(props: HudProps) {
    const ctr = new PIXI.Container();
    super(ctr);

    this.ctr.zIndex = ZLayer.t5;

    this.odaIcon = props.odaIcon;

    this.headBarMainGraphic = new PIXI.Graphics()
      .rect(0, 0, this.maxHealthBarWidth, 8)
      .fill({ color: 'yellow', alpha: 0.8 });

    this.maxHealthGraphic = new PIXI.Graphics()
      .rect(0, 0, this.maxHealthBarWidth, 10)
      .fill({ color: 'yellow', alpha: 0.2 })
      .stroke({ width: 2.15, color: 'white' });

    this.weaponIcon = props.weaponIcon;
    this.weaponIconBgGraphic = new PIXI.Graphics()
      .rect(0, 0, this.weaponIcon.width + 2, this.weaponIcon.height + 2)
      .fill({ color: 'orange' });

    this.ammoText = new PIXI.Text({
      style: new PIXI.TextStyle({
        fontFamily: 'pix',
        fontSize: 8,
        fill: { color: 'white' },
      }),
    });
    this.ammoText.resolution = 4;

    ctr.addChild(
      this.odaIcon,
      this.maxHealthGraphic,
      this.headBarMainGraphic,
      this.weaponIconBgGraphic,
      this.weaponIcon,
      this.ammoText,
    );

    this.maxHealthGraphic.x = this.odaIcon.x + this.odaIcon.width;
    this.maxHealthGraphic.y = 8;
    this.headBarMainGraphic.x = this.maxHealthGraphic.x;
    this.headBarMainGraphic.y = this.maxHealthGraphic.y + 1;

    this.weaponIconBgGraphic.y = this.odaIcon.y + this.odaIcon.height + 3;
    this.weaponIconBgGraphic.x = 3;

    this.weaponIcon.y = this.weaponIconBgGraphic.y + (this.weaponIconBgGraphic.height - this.weaponIcon.height) / 2;
    this.weaponIcon.x = this.weaponIconBgGraphic.x + (this.weaponIconBgGraphic.width - this.weaponIcon.width) / 2;

    this.ammoText.x = 25;
    this.ammoText.y = 30;
  }

  setHeathPercent(percent: number) {
    const normalizedPercent = percent * 0.01;
    const newHealthSize = this.maxHealthBarWidth * normalizedPercent;
    this.headBarMainGraphic.width = newHealthSize;
  }

  setGunText(ammo: string) {
    this.ammoText.text = `${ammo} `;
  }
}
