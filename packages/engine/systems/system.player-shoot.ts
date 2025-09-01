import * as PIXI from 'pixi.js';
import type { IOdaGun } from '../entity/eneity.oda-gun';
import { OdaEntity } from '../entity/entity.oda';
import type { IEntityStore } from '../entity/entity.store';
import { TrafficDrumEntity } from '../entity/entity.traffic-drum';
import { ZLayer } from '../types/enums';
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
    showTracer: odaGun.tracer,
    piercing: odaGun.piercing,
  };
};

let shotFired = false;
let lastShot = 0;
const handleNonAutomaticFiring = (props: { oda: OdaEntity; input: IInput }): boolean => {
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

const handleAutomaticFiring = (props: { oda: OdaEntity; input: IInput }): boolean => {
  const { oda, input } = props;
  if (!oda.gun) return false;

  const now = performance.now();
  if (now - lastShot < oda.gun.fireRate) return false;

  if (input.shoot.is.pressed && !oda.isShooting) {
    lastShot = performance.now();

    return true;
  }
  return false;
};

export const applyDebugGraphics = (props: { gameRef: PIXI.Container; rectArea: PIXI.Rectangle[]; odaGun: IOdaGun }) => {
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
  const isPiercing = oda.gun.piercing;

  const hittableEntities = [...entityStore.getAll(TrafficDrumEntity)].sort((a, b) => {
    const distA = (a.center.x - oda.center.x) ** 2 + (a.center.y - oda.center.y) ** 2;
    const distB = (b.center.x - oda.center.x) ** 2 + (b.center.y - oda.center.y) ** 2;
    return distA - distB;
  });

  const hitTrafficDrums: TrafficDrumEntity[] = [];

  const isWithinRangeArea = (entity: TrafficDrumEntity): boolean => {
    for (let ii = 0; ii < rangeArea.length; ii++) {
      if (entity.rect.intersects(rangeArea[ii])) {
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < hittableEntities.length; i++) {
    const entity = hittableEntities[i];
    const notInArr = !hitTrafficDrums.some((e) => e.id === entity.id);

    if (!isWithinRangeArea(entity) || !notInArr) continue;

    if (isPiercing) {
      hitTrafficDrums.push(entity);
    } else {
      if (spread > 1) {
        let shouldHit = false;

        if (hitTrafficDrums.length === 0) {
          shouldHit = true;
        } else {
          for (const hitEntity of hitTrafficDrums) {
            const dx = entity.center.x - hitEntity.center.x;
            const dy = entity.center.y - hitEntity.center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= 50) {
              shouldHit = true;
              break;
            }
          }
        }

        if (shouldHit) {
          hitTrafficDrums.push(entity);
        }
      } else {
        if (hitTrafficDrums.length === 0) {
          hitTrafficDrums.push(entity);
        }
      }
    }

    if (!isPiercing && spread === 1 && hitTrafficDrums.length > 0) break;
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
        shotFired = handleAutomaticFiring({ oda: oda, input: input });
      }
      if (!oda.gun.isAutomatic) {
        shotFired = handleNonAutomaticFiring({ oda: oda, input: input });
      }

      if (!shotFired) return;

      oda.gun.ammo--;
      bus.fire('odaShot', createOdaGunEvent(oda.gun));
      const flash = assetLoader.createSprite('rifle1Flash');
      applyGunFlash({ oda, gameRef, flash });

      const isFacingRight = oda.isFacingRight;
      const { rectArr } = createRectangleGraphic({
        range: oda.gun.range,
        shotFromPos: new PIXI.Point(oda.center.x, oda.center.y),
        spread: oda.gun.spread,
        size: oda.gun.areaSize,
        faceDirection: isFacingRight ? 'right' : 'left',
      });

      const hitArea = handleShotDamage({ oda, rangeArea: rectArr, entityStore });
      if (hitArea.length > 0) {
        const gunName = oda.gun.name || 'unknown-gun-name';
        hitArea.map((e) => bus.fire('shotHit', { gunName, area: e }));
        bus.fire('camShake', { duration: 100, magnitude: 3 });
        const hitRect = getFurthestRectFrom(oda.rect, hitArea);
        if (oda.gun.tracer) applyTracer({ oda, flash, hitRect, gameRef });
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

const applyTracer = (props: {
  oda: OdaEntity;
  flash: PIXI.Sprite;
  hitRect: PIXI.Rectangle;
  gameRef: PIXI.Container;
}) => {
  const { oda, flash, hitRect, gameRef } = props;

  let startX = 0;
  let endX = 0;
  let tracerWidth = 0;
  const startY = flash.y + 7;
  const tracerSize = oda.gun.tracer;

  if (oda.isFacingRight) {
    startX = flash.x + 25;
    endX = hitRect.x - 30;
    tracerWidth = Math.max(0, endX - startX);
  } else {
    startX = flash.x - 25;
    endX = hitRect.x + hitRect.width + 30;
    tracerWidth = Math.max(0, startX - endX);
    startX = endX;
  }

  const graphic = new PIXI.Graphics()
    .rect(startX, startY, tracerWidth, tracerSize)
    .fill({ color: 'white', alpha: 0.85 });

  gameRef.addChild(graphic);
  setTimeout(() => gameRef.removeChild(graphic), 50);
};

const applyGunFlash = (props: { oda: OdaEntity; flash: PIXI.Sprite; gameRef: PIXI.Container }) => {
  const { oda, flash, gameRef } = props;
  const gun = oda.gun;
  const odaGunRect = new PIXI.Rectangle(gun.sprite.x, gun.sprite.y, gun.sprite.width, gun.sprite.height);

  if (!oda.isFacingRight) {
    odaGunRect.x -= gun.sprite.width * (1 - 0.25);
  }

  flash.y = odaGunRect.top + (odaGunRect.height * 0.5 - flash.height * 0.5);

  setTimeout(() => {
    gameRef.removeChild(flash);
  }, 35);

  if (oda.isFacingRight) {
    flash.scale.set(1, 1);
    flash.pivot.set(0, 0);
    flash.x = odaGunRect.right;
  } else {
    flash.scale.set(-1, 1);
    flash.pivot.set(0, 0);
    flash.x = odaGunRect.left;
  }

  if (gun.name === 'Raygun') {
    flash.y -= 4;
  }

  if (oda.isRolling) {
  }

  flash.zIndex = ZLayer.m2;
  gameRef.addChild(flash);
};

const getFurthestRectFrom = (rect: PIXI.Rectangle, rects: PIXI.Rectangle[]): PIXI.Rectangle => {
  if (rects.length === 0) {
    throw new Error('length of rects need to be larger than 0');
  }

  const rectCenterX = rect.x + rect.width / 2;
  const rectCenterY = rect.y + rect.height / 2;

  let furthestRect = rects[0];
  let maxDistanceSq = 0;

  for (let i = 0; i < rects.length; i++) {
    const currentRect = rects[i];
    const currentRectCenterX = currentRect.x + currentRect.width / 2;
    const currentRectCenterY = currentRect.y + currentRect.height / 2;

    const dx = currentRectCenterX - rectCenterX;
    const dy = currentRectCenterY - rectCenterY;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq > maxDistanceSq) {
      maxDistanceSq = distanceSq;
      furthestRect = currentRect;
    }
  }

  return furthestRect;
};
