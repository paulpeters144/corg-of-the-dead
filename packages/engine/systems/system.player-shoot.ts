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
  size: number;
  spread: number;
  oda: OdaEntity;
}) => {
  const { range, oda, faceDirection, size, spread } = props;
  if (spread % 2 === 0) {
    throw Error('spread must be an odd number');
  }

  const rectArr: PIXI.Rectangle[] = [];
  for (let i = 0; i < range; i++) {
    const currentSpread = 1 + Math.floor(((spread - 1) * i) / (range - 1));
    const halfSpread = Math.floor(currentSpread / 2);
    const x = faceDirection === 'right' ? i * (size + 1) : -i * (size + 1);
    for (let ii = -halfSpread; ii <= halfSpread; ii++) {
      const rect = new PIXI.Rectangle(oda.center.x + x, oda.center.y, size, size);
      rectArr.push(rect);
    }
  }
  return {
    rectArr,
  };
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

const applyDebugGraphics = (props: { gameRef: PIXI.Container; rectArea: PIXI.Rectangle[]; odaGun: IOdaGun }) => {
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

  const hittableEntities = [...entityStore.getAll(TrafficDrumEntity)].sort((a, b) => {
    const distA = (a.center.x - oda.center.x) ** 2 + (a.center.y - oda.center.y) ** 2;
    const distB = (b.center.x - oda.center.x) ** 2 + (b.center.y - oda.center.y) ** 2;
    return distA - distB;
  });

  const hitEntity = hittableEntities.find((hittableEntity) =>
    rangeArea.some((areaRect) => areaRect.intersects(hittableEntity.hitRect)),
  );

  let _hitAreaRect: PIXI.Rectangle | undefined;
  if (hitEntity) {
    _hitAreaRect = rangeArea.find((rect) => rect.intersects(hitEntity.hitRect));
  }

  const died = hitEntity?.recieveDamage(oda.gun?.damage || 0);
  if (hitEntity && died) {
    entityStore.remove(hitEntity);
  }

  return hitEntity?.hitRect;
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
        range: 20,
        size: 15,
        oda,
        spread: 1,
        faceDirection: isFacingRight ? 'right' : 'left',
      });
      const hitArea = handleShotDamage({ oda, rangeArea: rectArr, entityStore });
      if (hitArea) {
        bus.fire('shotHit', { gunName: oda.gun.name, area: hitArea });
        bus.fire('camShake', {
          duration: 250,
          magnitude: 8,
        });
      } else {
        const furthestRect = rectArr.reduce((prev, curr) => {
          const prevDist = Math.abs(oda.center.x - prev.x);
          const currDist = Math.abs(oda.center.x - curr.x);
          return prevDist > currDist ? prev : curr;
        });
        bus.fire('shotMiss', { gunName: oda.gun.name, area: furthestRect });
      }
      // applyDebugGraphics({ gameRef, rectArea: rectArr, odaGun: oda.gun })
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
    }, 50);
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
