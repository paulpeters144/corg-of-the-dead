import * as PIXI from 'pixi.js';
import { ZLayer } from '../types/enums';
import type { IOdaGun } from './eneity.oda-gun';
import { Entity } from './entity';

export class GunHudInfoEntity extends Entity {
  gunList: IOdaGun[];
  gunGraphics: {
    name: string;
    ctr: PIXI.Container;
    ammoText: PIXI.Text;
  }[] = [];
  selectGraphic = new PIXI.Graphics().roundRect(0, 0, 50, 21, 1).stroke({ width: 2, color: 'white' });
  selectedIdx = 0;

  private time: number = 0; // for animation

  constructor(props: { gunList: IOdaGun[] }) {
    super(new PIXI.Container());

    this.gunList = props.gunList;
    this.setNewGunList(props.gunList);

    this.ctr.addChild(this.selectGraphic);
    this._setSelectedGraphicInPosition();
    this.selectGraphic.visible = false;

    this.selectGraphic.pivot.set(this.selectGraphic.width / 2, this.selectGraphic.height / 2);
  }

  setNewGunList(gunList: IOdaGun[]) {
    this.gunList = gunList;
    this.gunGraphics.map((g) => this.ctr.removeChild(g.ctr));
    this.gunGraphics.length = 0;

    for (const g of this.gunList) {
      const ctr = new PIXI.Container();
      const gunIcon = new PIXI.Sprite(g.assets.icon);
      gunIcon.x += 3;

      const ammoText = this._getNewTextInstance();
      ammoText.text = g.ammo.toString();

      ctr.addChild(gunIcon, ammoText);
      ammoText.x = gunIcon.x + gunIcon.width + 5;
      ammoText.y = gunIcon.y + 5;

      if (this.gunGraphics.length !== 0) {
        const lastGunCtr = this.gunGraphics[this.gunGraphics.length - 1].ctr;
        ctr.y = lastGunCtr.y + lastGunCtr.height + 8;
        ctr.visible = false;
      }

      this.ctr.addChild(ctr);
      this.gunGraphics.push({ name: g.name, ctr: ctr, ammoText });
    }
  }

  showGunList() {
    if (this.gunGraphics.find((g) => !g.ctr.visible)) {
      for (const g of this.gunGraphics) g.ctr.visible = true;

      this.selectGraphic.visible = true;
    }
  }

  hidNonActiveGuns(): string | null {
    if (this.gunGraphics.every((g) => g.ctr.visible)) {
      for (const g of this.gunGraphics.slice(1)) g.ctr.visible = true;

      const selectedGunName = this.gunList.at(this.selectedIdx)?.name ?? null;
      this.selectedIdx = 0;
      this._setSelectedGraphicInPosition();
      this.selectGraphic.visible = false;
      return selectedGunName;
    }
    return null;
  }

  update(delta: number) {
    if (!this.selectGraphic.visible) return;

    this.time += delta * 0.5; // control animation speed
    const scale = 1 + Math.sin(this.time) * 0.05; // 5% grow/shrink
    this.selectGraphic.scale.set(scale);
  }

  lastIdxChange = 0;
  hoverSelectNext() {
    const now = performance.now();
    if (now - this.lastIdxChange < 100) return;

    this.selectedIdx++;
    if (this.selectedIdx > this.gunList.length - 1) {
      this.selectedIdx = 0;
    }
    this._setSelectedGraphicInPosition();
    this.lastIdxChange = now;
  }

  hoverSelectPrev() {
    const now = performance.now();
    if (now - this.lastIdxChange < 100) return;

    this.selectedIdx--;
    if (this.selectedIdx < 0) {
      this.selectedIdx = this.gunList.length - 1;
    }
    this._setSelectedGraphicInPosition();
    this.lastIdxChange = now;
  }

  private _setSelectedGraphicInPosition() {
    this.selectGraphic.x = this.gunGraphics[this.selectedIdx].ctr.x + this.selectGraphic.width * 0.5;
    this.selectGraphic.y = this.gunGraphics[this.selectedIdx].ctr.y + this.selectGraphic.height * 0.433;
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

interface HudProps {
  odaIcon: PIXI.Sprite;
  gunList: IOdaGun[];
}

export class HeadsUpDisplayEntity extends Entity {
  maxHealthBarWidth = 150;
  maxHealthGraphic: PIXI.Graphics;
  headBarMainGraphic: PIXI.Graphics;
  odaIcon?: PIXI.Sprite;

  gunListCtr: PIXI.Container = new PIXI.Container();
  gunInfo: GunHudInfoEntity;

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

    this.ctr.addChild(this.odaIcon, this.maxHealthGraphic, this.headBarMainGraphic);

    this.maxHealthGraphic.x = this.odaIcon.x + this.odaIcon.width;
    this.maxHealthGraphic.y = 8;
    this.headBarMainGraphic.x = this.maxHealthGraphic.x;
    this.headBarMainGraphic.y = this.maxHealthGraphic.y + 1;

    this.gunInfo = new GunHudInfoEntity({ gunList: props.gunList });
    this.ctr.addChild(this.gunInfo.ctr);
    this.gunInfo.ctr.y = this.odaIcon.y + this.odaIcon.height + 5;
  }

  update(delta: number) {
    this.gunInfo.update(delta);
  }

  setHeathPercent(percent: number) {
    const normalizedPercent = percent * 0.01;
    const newHealthSize = this.maxHealthBarWidth * normalizedPercent;
    this.headBarMainGraphic.width = newHealthSize;
  }

  hideGunList = () => this.gunInfo.hidNonActiveGuns();
  showGunList = () => this.gunInfo.showGunList();
}
