import * as PIXI from 'pixi.js';
import type { IOdaGun } from '../entity/eneity.oda-gun';
import { OdaEntity } from '../entity/entity.oda';
import type { IEntityStore } from '../entity/entity.store';
import { TrafficDrumEntity } from '../entity/entity.traffic-drum';
import type { IInput } from '../util/control/input.control';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

const createRectangleGraphic = (props: {
  range: number;
  faceDirection: 'right' | 'left';
  size?: number;
  spread: number;
  shotFromPos: PIXI.Point;
}) => {
  const { range, shotFromPos, faceDirection, size = 12, spread } = props;

  if (spread % 2 === 0) {
    throw Error('spread must be an odd number');
  }

  const rectArr: PIXI.Rectangle[] = [];

  for (let i = 1; i < range; i++) {
    if (i < 3) continue;

    const currentSpread = 1 + Math.floor(((spread - 1) * i) / (range - 1));
    const halfSpread = Math.floor(currentSpread / 2);

    const x = faceDirection === 'right' ? i * (size + 1) : -i * (size + 1);

    for (let ii = -halfSpread; ii <= halfSpread; ii++) {
      const y = shotFromPos.y + ii * (size + 1); // <-- apply vertical offset
      const rect = new PIXI.Rectangle(shotFromPos.x + x, y, size, size);
      rectArr.push(rect);
    }
  }

  return { rectArr };
};

const createOdaGunEvent = (odaGun: IOdaGun) => {
  return {
    ammo: odaGun.ammo,
    rect: odaGun.rect,
    name: odaGun.name,
    fireRate: odaGun.fireRate,
    damage: odaGun.damage,
    isAutomatic: odaGun.isAutomatic,
    range: odaGun.range,
    spread: odaGun.spread,
    animationSpeed: odaGun.animationSpeed,
  };
};

let shotFired = false;
let lastShot = 0;
const _handleNonAutomaticFiring = (props: { oda: OdaEntity; input: IInput }): boolean => {
  const { oda, input } = props;
  if (!oda.gun) return false;
  if (oda.gun.ammo <= 0) return false;

  const now = performance.now();
  if (now - lastShot < oda.gun.fireRate) return false;

  if (input.shoot.is.pressed && !shotFired && !oda.isShooting) {
    oda.setShoot();
    shotFired = true;
    lastShot = performance.now();

    return true;
  }

  if (shotFired && input.shoot.is.released) {
    shotFired = false;
  }
  return false;
};

const _handleAutomaticFiring = (props: { oda: OdaEntity; input: IInput }): boolean => {
  const { oda, input } = props;
  if (!oda.gun) return false;

  const now = performance.now();
  if (now - lastShot < oda.gun.fireRate) return false;

  if (input.shoot.is.pressed && !oda.isShooting) {
    // oda.setShoot();
    lastShot = performance.now();

    return true;
  }
  return false;
};

const _applyDebugGraphics = (props: { gameRef: PIXI.Container; rectArea: PIXI.Rectangle[]; odaGun: IOdaGun }) => {
  const { gameRef, rectArea } = props;
  const graphicArea: PIXI.Graphics[] = [];

  for (let i = 0; i < rectArea.length; i++) {
    const area = rectArea[i];
    const { x, y, width, height } = area;
    const graphic = new PIXI.Graphics().rect(x, y, width, height).fill({ color: 'green' });
    graphicArea.push(graphic);
  }

  gameRef.addChild(...graphicArea);

  setTimeout(() => {
    gameRef.removeChild(...graphicArea);
  }, 3000);
};

const handleShotDamage = (props: { oda: OdaEntity; rangeArea: PIXI.Rectangle[]; entityStore: IEntityStore }) => {
  const { oda, rangeArea, entityStore } = props;
  if (!oda.gun) throw new Error('shooting with no gun... not a good idea');
  const spread = oda.gun.spread;

  const hittableEntities = [...entityStore.getAll(TrafficDrumEntity)].sort((a, b) => {
    const distA = (a.center.x - oda.center.x) ** 2 + (a.center.y - oda.center.y) ** 2;
    const distB = (b.center.x - oda.center.x) ** 2 + (b.center.y - oda.center.y) ** 2;
    return distA - distB;
  });

  const hitTrafficDrums: TrafficDrumEntity[] = [];

  for (let i = 0; i < hittableEntities.length; i++) {
    const entity = hittableEntities[i];
    for (let ii = 0; ii < rangeArea.length; ii++) {
      const rangeRect = rangeArea[ii];
      const intersects = entity.rect.intersects(rangeRect);
      if (intersects) {
        const firstEntityXPos = hitTrafficDrums.at(0)?.rect.x || entity.rect.x;
        const notInArr = !hitTrafficDrums.some((e) => e.id === entity.id);
        const withInXPosBuff = Math.abs(entity.rect.x - firstEntityXPos) < 50;
        if (notInArr && withInXPosBuff) {
          hitTrafficDrums.push(entity);
        }
      }
      if (hitTrafficDrums.length >= spread) break;
    }
  }

  for (let i = 0; i < hitTrafficDrums.length; i++) {
    const entity = hitTrafficDrums[i];
    if (entity?.recieveDamage(oda.gun?.damage || 0)) {
      entityStore.remove(entity);
    }
  }

  return hitTrafficDrums.map((e) => e.rect);
};

export const createPlayerShootSystem = (di: IDiContainer): ISystem => {
  const input = di.input();
  const bus = di.eventBus();
  const entityStore = di.entityStore();
  const assetLoader = di.assetLoader();
  const oda = entityStore.first(OdaEntity);
  const gameRef = di.gameRef();

  if (!oda) throw new Error('create cam orb with no oda entity');

  return {
    name: () => 'player-shoot-system',
    update: (_: number) => {
      if (!oda.gun) return;
      if (oda.isRolling) return;
      if (input.option.is.pressed) return;

      let shotFired = false;
      if (oda.gun.isAutomatic) {
        shotFired = _handleAutomaticFiring({ oda: oda, input: input });
      }
      if (!oda.gun.isAutomatic) {
        shotFired = _handleNonAutomaticFiring({ oda: oda, input: input });
      }

      if (!shotFired) return;

      oda.gun.ammo--;
      bus.fire('odaShot', createOdaGunEvent(oda.gun));
      const flash = assetLoader.createSprite('rifle1Flash');
      applyGunFlash({ oda, gameRef, flash });

      const isFacingRight = oda.isFacingRight;
      const { rectArr } = createRectangleGraphic({
        range: oda.gun.range,
        shotFromPos: new PIXI.Point(oda.center.x, oda.center.y), // TOOD: refact Postitions to be PIXI.Points
        spread: oda.gun.spread,
        faceDirection: isFacingRight ? 'right' : 'left',
      });

      const hitArea = handleShotDamage({ oda, rangeArea: rectArr, entityStore });
      if (hitArea.length > 0) {
        const gunName = oda.gun.name || 'unknown-gun-name';
        hitArea.map((e) => bus.fire('shotHit', { gunName, area: e }));
        bus.fire('camShake', {
          duration: 100,
          magnitude: 3,
        });
      } else {
        const furthestRect = rectArr.reduce((prev, curr) => {
          const prevDist = Math.abs(oda.center.x - prev.x);
          const currDist = Math.abs(oda.center.x - curr.x);
          return prevDist > currDist ? prev : curr;
        });
        furthestRect.y = oda.center.y;
        bus.fire('shotMiss', { gunName: oda.gun.name, area: furthestRect });
      }

      // applyDebugGraphics({ gameRef, rectArea: rectArr, odaGun: oda.gun });
    },
  };
};
const applyGunFlash = (props: { oda: OdaEntity; flash: PIXI.Sprite; gameRef: PIXI.Container }) => {
  const { oda, flash, gameRef } = props;

  const odaGunRect = oda.gun?.rect;
  if (odaGunRect) {
    flash.y = odaGunRect.top + (odaGunRect.height * 0.5 - flash.height * 0.5);
    setTimeout(() => {
      gameRef.removeChild(flash);
    }, 35);
    if (oda.isFacingRight) {
      flash.x = odaGunRect.right + 3;
    } else {
      flash.x = odaGunRect.left - 5;
      flash.scale.set(-1, 1);
      flash.x -= flash.width;
    }
    flash.zIndex = 9999;

    gameRef.addChild(flash);
  }
};
