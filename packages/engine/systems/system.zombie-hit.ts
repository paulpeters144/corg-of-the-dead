import { ZombieOneEntity } from '../entity/entity.zombie-one';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';
import { randNum } from '../util/util';

interface HitEvent {
  zombie: ZombieOneEntity;
  direction: 'right' | 'left';
  hitTime: number;
  flashSet: boolean;
  fall: {
    curr: number;
    max: number;
    speed: number;
  }
}

const handleZombieDieAnim = (props: { delta: number; now: number; e: HitEvent }) => {
  const { delta, now, e } = props;
  const { zombie } = e;

  if (!e.flashSet) {
    zombie.setRedFilter();
    e.flashSet = true;
    setTimeout(() => { zombie.ctr.filters = [] }, 100)
  }
  if (!zombie.isActiveAnim('die')) {
    zombie.setAnimation('die');
  }


  let result = false;


  if (zombie.isActiveAnim('die')) {
    const percent = e.fall.curr / e.fall.max;

    let easedSpeed = e.fall.speed * (1 - percent);
    easedSpeed = easedSpeed > 15 ? easedSpeed : 15;

    const moveDist = (delta * easedSpeed);

    e.fall.curr += moveDist;
    if (e.direction === 'right') {
      zombie.ctr.x += moveDist;
    } else {
      zombie.ctr.x -= moveDist;
    }
  }

  if (now - e.hitTime > 650 && zombie.isActiveAnim('die')) {
    result = true
  }
  return {
    removeZombie: result,
  }
}

const handleZombieFallBack = (props: { delta: number; now: number; e: HitEvent }) => {
  const { delta, now, e } = props;
  let result = false;
  const { zombie } = e;
  if (!e.flashSet) {
    zombie.setRedFilter();
    e.flashSet = true;
    zombie.setAnimation('fall')
  }

  if (zombie.hasFilter && now - e.hitTime > 75) {
    zombie.ctr.filters = [];
  }


  if (zombie.isActiveAnim('fall') && e.fall.curr < e.fall.max) {
    const percent = e.fall.curr / e.fall.max;

    let easedSpeed = e.fall.speed * (1.15 - percent);
    easedSpeed = easedSpeed > 15 ? easedSpeed : 15;

    const moveDist = delta * easedSpeed;

    e.fall.curr += moveDist;
    if (e.direction === 'right') {
      zombie.ctr.x += moveDist;
    } else {
      zombie.ctr.x -= moveDist;
    }
  }

  if (now - e.hitTime > 1500 && zombie.isActiveAnim('fall')) {
    zombie.setAnimation('revive');
  }
  if (zombie.isActiveAnim('revive') && zombie.onLastFrame) {
    zombie.setAnimation('idle')
    result = true;
  }
  return {
    removeZombie: result,
  }
}

export const createZombieHitSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const bus = di.eventBus();

  const eventDic = new Map<string, HitEvent>();

  bus.on('zombiePollHit', (e) => {
    const zombie = entityStore.getById(e.id) as ZombieOneEntity;
    if (!zombie) return;

    zombie.recieveDamage(e.damage);

    if (zombie.health <= 0 && e.direction === "left") {
      e.direction === "left" ? zombie.faceRight() : zombie.faceLeft();
    }

    const distFall = randNum(100, 150);
    eventDic.set(zombie.id, {
      zombie: zombie,
      direction: e.direction,
      hitTime: performance.now(),
      flashSet: false,
      fall: {
        max: distFall,
        speed: distFall * 0.4,
        curr: 0,
      }
    });
  });

  return {
    name: () => 'zombie-hit-system',
    update: (delta: number) => {
      if (eventDic.size === 0) return;

      const now = performance.now();

      for (const e of eventDic.values()) {
        const { zombie } = e;

        if (zombie.health <= 0) {
          const { removeZombie } = handleZombieDieAnim({ delta, now, e })
          if (removeZombie) {
            entityStore.remove(zombie)
            eventDic.delete(zombie.id);
          }
        }

        if (zombie.health > 0) {
          const { removeZombie } = handleZombieFallBack({ delta, now, e })
          if (removeZombie) eventDic.delete(zombie.id);
        }
      }
    },
  };
};
