import * as PIXI from 'pixi.js';
import { OdaEntity } from '../entity/entity.oda';
import { TrafficDrumEntity } from '../entity/entity.traffic-drum';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

type Point = { x: number; y: number };
type BoundaryBox = { center: Point; rect: PIXI.Rectangle };

function isCloseBy(target: Point, candidate: Point, dx = 66, dy = 150): boolean {
  return Math.abs(candidate.x - target.x) < dx && Math.abs(candidate.y - target.y) < dy;
}

function byDistance(target: Point) {
  return (a: BoundaryBox, b: BoundaryBox) => {
    const distA = (a.center.x - target.x) ** 2 + (a.center.y - target.y) ** 2;
    const distB = (b.center.x - target.x) ** 2 + (b.center.y - target.y) ** 2;
    return distA - distB;
  };
}

const randNum = (min: number, max: number) => {
  const step1 = Math.random() * (max - min + 1);
  return Math.floor(step1) + min;
};

export const createPollHitAreaSystem = (di: IDiContainer): ISystem => {
  const gameRef = di.gameRef();
  const entityStore = di.entityStore();
  const oda = entityStore.first(OdaEntity);
  const bus = di.eventBus();
  if (!oda) throw new Error('oda not found');

  let graphicActive = false;
  const showDebugGraphics = (_rect: PIXI.Rectangle) => {
    // const graphic = new PIXI.Graphics()
    //   .rect(rect.x, rect.y, rect.width, rect.height)
    //   .stroke({ color: 'white', alpha: 0.8 });
    // graphic.zIndex = 999;
    // gameRef.addChild(graphic);
    setTimeout(() => {
      // gameRef.removeChild(graphic);
      graphicActive = false;
    }, 250);
    graphicActive = true;
  };

  const showHitMarker = (p: Point) => {
    const graphic = new PIXI.Graphics();
    const size = 10;
    const point = new PIXI.Point(randNum(p.x - 2.5, p.x + 2.5), randNum(p.y - 2.5, p.y + 2.5));

    graphic
      .moveTo(point.x - size, point.y - size)
      .lineTo(point.x + size, point.y + size)
      .moveTo(point.x - size, point.y + size)
      .lineTo(point.x + size, point.y - size)
      .stroke({ color: 'white', width: 3, alpha: 0.9 });

    graphic.zIndex = 1000;
    gameRef.addChild(graphic);

    setTimeout(() => {
      gameRef.removeChild(graphic);
    }, 75);
  };

  return {
    name: () => 'poll-hit-area-system',
    update: (_: number) => {
      if (!oda.isActiveAnim('pollSwing')) return;
      if (!graphicActive && oda.anim.currentFrame === 1) {
        const p = oda.poll.anim;
        const rect = new PIXI.Rectangle(p.x, p.y + 20, p.width, p.height - 35);

        if (!oda.isFacingRight) {
          rect.x -= rect.width * 0.75;
        }

        const hitDrums = entityStore
          .getAll(TrafficDrumEntity)
          .filter((e) => isCloseBy(oda.center, e.center))
          .sort(byDistance(oda.center))
          .filter((e) => e.rect.intersects(rect));

        if (hitDrums.length > 0) {
          hitDrums.map((e) => showHitMarker(e.center));
          hitDrums.filter((e) => e.recieveDamage(oda.poll.damage)).map((e) => entityStore.remove(e));
          bus.fire('camShake', { duration: 100, magnitude: 3 });
        }

        showDebugGraphics(rect);
      }
    },
  };
};
