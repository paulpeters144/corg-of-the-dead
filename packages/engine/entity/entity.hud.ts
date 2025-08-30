import * as PIXI from 'pixi.js';
import { ZLayer } from '../types/enums';
import type { IOdaGun } from './eneity.oda-gun';
import { Entity } from './entity';

interface HudProps {
  odaIcon: PIXI.Sprite;
  weaponIcon: PIXI.Sprite;
}

export class HeadsUpDisplayEntity extends Entity {
  maxHealthBarWidth = 150;
  maxHealthGraphic: PIXI.Graphics;
  headBarMainGraphic: PIXI.Graphics;
  gunListCtr: PIXI.Container = new PIXI.Container();
  odaIcon: PIXI.Sprite;
  weaponIcon: PIXI.Sprite;
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

    this.ammoText = this._getNewTextInstance();

    ctr.addChild(
      this.odaIcon,
      this.maxHealthGraphic,
      this.headBarMainGraphic,
      this.weaponIcon,
      this.ammoText,
      this.gunListCtr,
    );

    this.maxHealthGraphic.x = this.odaIcon.x + this.odaIcon.width;
    this.maxHealthGraphic.y = 8;
    this.headBarMainGraphic.x = this.maxHealthGraphic.x;
    this.headBarMainGraphic.y = this.maxHealthGraphic.y + 1;

    this.weaponIcon.y = this.odaIcon.y + this.odaIcon.height + 3;
    this.weaponIcon.x = 3;

    this.ammoText.x = 25;
    this.ammoText.y = 30;
  }

  setHeathPercent(percent: number) {
    const normalizedPercent = percent * 0.01;
    const newHealthSize = this.maxHealthBarWidth * normalizedPercent;
    this.headBarMainGraphic.width = newHealthSize;
  }

  setGunText(text: string) {
    this.ammoText.text = `${text} `;
  }

  addGunOptions(gunList: IOdaGun[]) {
    if (this.gunListCtr.children.length > 0) return;
    for (let i = 0; i < gunList.length; i++) {
      if (i === 0) continue;
      const gun = gunList[i];
      const text = this._getNewTextInstance();
      text.text = `${gun.ammo} ${gun.name}`;
      const gunIconSprite = new PIXI.Sprite(gun.assets.icon);
      this.gunListCtr.addChild(gunIconSprite, text);
      const lastPos = {
        x: this.weaponIcon.x,
        y: this.weaponIcon.y + this.weaponIcon.height + 3,
      };
      this.gunListCtr.x = lastPos.x;
      this.gunListCtr.y = lastPos.y + 1;
      text.x = gunIconSprite.x + gunIconSprite.width + 4;
      text.y = gunIconSprite.y + 5;
    }
  }

  private _getNewTextInstance() {
    const result = new PIXI.Text({
      style: new PIXI.TextStyle({
        fontFamily: 'pix',
        fontSize: 8,
        fill: { color: 'white' },
      }),
    });
    result.resolution = 4;
    return result;
  }
}
