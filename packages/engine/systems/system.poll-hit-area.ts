import * as PIXI from 'pixi.js';
import { OdaEntity } from '../entity/entity.oda';
import { TrafficDrumEntity } from '../entity/entity.traffic-drum';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';
import { byDistanceAsc, isCloseBy, randNum } from '../util/util';

export const createPollHitAreaSystem = (di: IDiContainer): ISystem => {
  const gameRef = di.gameRef();
  const entityStore = di.entityStore();
  const oda = entityStore.first(OdaEntity);
  const bus = di.eventBus();
  if (!oda) throw new Error('oda not found');


  const showHitMarker = (p: { x: number; y: number }) => {
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
      if (oda.anim.currentFrame === 1) {
        const p = oda.poll.anim;
        const rect = new PIXI.Rectangle(p.x, p.y + 20, p.width, p.height - 35);

        if (!oda.isFacingRight) {
          rect.x -= rect.width * 0.75;
        }

        const hitDrums = entityStore
          .getAll(TrafficDrumEntity)
          .filter((e) => isCloseBy(oda.center, e.center))
          .sort(byDistanceAsc(oda.center))
          .filter((e) => e.rect.intersects(rect));

        if (hitDrums.length > 0) {
          for (const drum of hitDrums) {
            showHitMarker(drum.center);
            drum.recieveDamage(oda.poll.damage);
            if (drum.health <= 0) {
              entityStore.remove(drum);
              bus.fire('camShake', { duration: 75, magnitude: 7 });
            } else {
              bus.fire('camShake', { duration: 50, magnitude: 5 });
            }
            bus.fire('impactBounce', {
              id: drum.id,
              direction: oda.isFacingRight ? 'right' : 'left',
              power: 100,
            });
          }
        }
      }
    },
  };
};
