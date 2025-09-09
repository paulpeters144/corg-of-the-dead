import * as PIXI from 'pixi.js';
import { ZLayer } from '../types/enums';
import { Entity } from './entity';
import type { IOdaGun } from './entity.oda-gun';
import type { IOdaPoll } from './entity.oda-poll';

type weaponList = (
  | {
      type: 'gun';
      weapon: IOdaGun;
    }
  | {
      type: 'poll';
      weapon: IOdaPoll;
    }
)[];

export class GunHudInfoEntity extends Entity {
  weaponList: weaponList;

  weaponGraphics: {
    name: string;
    ctr: PIXI.Container;
    ammoText: PIXI.Text;
  }[] = [];

  selectGraphic = new PIXI.Graphics().roundRect(0, 0, 50, 21, 1).stroke({ width: 2, color: 'white' });

  selectedIdx = 0;

  get activeWeapon() {
    return this.weaponList[0];
  }

  get selectedWeapon() {
    return this.weaponList[this.selectedIdx];
  }

  private time: number = 0; // for animation

  constructor(props: { weaponsList: weaponList }) {
    super(new PIXI.Container());

    this.weaponList = props.weaponsList;
    this.setNewWeaponList(props.weaponsList);

    this.ctr.addChild(this.selectGraphic);
    this._setSelectedGraphicInPosition();
    this.selectGraphic.visible = false;

    this.selectGraphic.pivot.set(this.selectGraphic.width / 2, this.selectGraphic.height / 2);
  }

  setNewWeaponList(weaponList: weaponList) {
    this.weaponList = weaponList;
    this.weaponGraphics.map((g) => this.ctr.removeChild(g.ctr));
    this.weaponGraphics.length = 0;

    for (const weapon of this.weaponList) {
      const ctr = new PIXI.Container();
      const w = weapon.weapon;
      const gunIcon = new PIXI.Sprite(w.assets.icon);
      gunIcon.x += 3;

      const ammoText = this._getNewTextInstance();
      ammoText.text = weapon.type === 'gun' ? weapon.weapon.ammo.toString() : 'infinite';

      ctr.addChild(gunIcon, ammoText);
      ammoText.x = gunIcon.x + gunIcon.width + 5;
      ammoText.y = gunIcon.y + 5;

      if (this.weaponGraphics.length !== 0) {
        const lastGunCtr = this.weaponGraphics[this.weaponGraphics.length - 1].ctr;
        ctr.y = lastGunCtr.y + lastGunCtr.height + 8;
        ctr.visible = false;
      }

      this.ctr.addChild(ctr);
      this.weaponGraphics.push({ name: w.name, ctr: ctr, ammoText });
    }
  }

  showWeaponList() {
    if (this.weaponGraphics.find((g) => !g.ctr.visible)) {
      for (const g of this.weaponGraphics) g.ctr.visible = true;

      this.selectGraphic.visible = true;
    }
  }

  hideWeaponList() {
    this.weaponList = [
      this.selectedWeapon,
      ...this.weaponList
        .filter((w) => w.weapon.name !== this.selectedWeapon.weapon.name)
        .sort((a, b) => a.weapon.name.localeCompare(b.weapon.name)),
    ];

    if (this.weaponGraphics.every((g) => g.ctr.visible)) {
      for (const g of this.weaponGraphics.slice(1)) g.ctr.visible = false;

      this.selectedIdx = 0;
      this._setSelectedGraphicInPosition();
      this.selectGraphic.visible = false;
    }

    this.setNewWeaponList(this.weaponList);
  }

  update(delta: number) {
    if (!this.selectGraphic.visible) return;

    this.time += delta * 0.5;
    const scale = 1 + Math.sin(this.time) * 0.05;
    this.selectGraphic.scale.set(scale);
  }

  lastIdxChange = 0;
  hoverSelectNext() {
    const now = performance.now();
    if (now - this.lastIdxChange < 100) return;

    this.selectedIdx++;
    if (this.selectedIdx > this.weaponList.length - 1) {
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
      this.selectedIdx = this.weaponList.length - 1;
    }
    this._setSelectedGraphicInPosition();
    this.lastIdxChange = now;
  }

  private _setSelectedGraphicInPosition() {
    this.selectGraphic.x = this.weaponGraphics[this.selectedIdx].ctr.x + this.selectGraphic.width * 0.5;
    this.selectGraphic.y = this.weaponGraphics[this.selectedIdx].ctr.y + this.selectGraphic.height * 0.433;
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

type weaponListType =
  | {
      type: 'gun';
      weapon: IOdaGun;
    }
  | {
      type: 'poll';
      weapon: IOdaPoll;
    };

type HudPropsType = {
  odaIcon: PIXI.Sprite;
  weaponList: weaponListType[];
};

export class HeadsUpDisplayEntity extends Entity {
  maxHealthBarWidth = 150;
  maxHealthGraphic: PIXI.Graphics;
  headBarMainGraphic: PIXI.Graphics;
  odaIcon?: PIXI.Sprite;

  gunListCtr: PIXI.Container = new PIXI.Container();
  gunInfo: GunHudInfoEntity;

  constructor(props: HudPropsType) {
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

    this.gunInfo = new GunHudInfoEntity({ weaponsList: props.weaponList });
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

  hideGunList = () => this.gunInfo.hideWeaponList();
  showGunList = () => this.gunInfo.showWeaponList();
  activeWeapon = () => this.gunInfo.activeWeapon;
}
