import type { ZombieOneEntity } from '../entity/entity.zombie-one';
import type { IDiContainer } from '../util/di-container';
import { randNum } from '../util/util';
import type { ISystem } from './system.agg';

interface PollHitEvent {
  zombie: ZombieOneEntity;
  direction: 'right' | 'left';
  hitTime: number;
  flashSet: boolean;
  fall: {
    curr: number;
    max: number;
    speed: number;
  };
}

interface GunHitEvent {
  zombie: ZombieOneEntity;
  direction: 'right' | 'left';
  hitTime: number;
  flashSet: boolean;
  fall: {
    curr: number;
    max: number;
    speed: number;
  };
}

const pollZombieDieAnim = (props: { delta: number; now: number; e: PollHitEvent }) => {
  const { delta, now, e } = props;
  const { zombie } = e;

  if (!e.flashSet) {
    zombie.setRedFilter();
    e.flashSet = true;
    setTimeout(() => {
      zombie.ctr.filters = [];
    }, 100);
  }
  if (!zombie.isActiveAnim('die')) {
    zombie.setAnimation('die');
  }

  let result = false;

  if (zombie.isActiveAnim('die')) {
    const percent = e.fall.curr / e.fall.max;

    let easedSpeed = e.fall.speed * (1 - percent);
    easedSpeed = easedSpeed > 15 ? easedSpeed : 15;

    const moveDist = delta * easedSpeed;

    e.fall.curr += moveDist;
    if (e.direction === 'right') {
      zombie.ctr.x += moveDist;
    } else {
      zombie.ctr.x -= moveDist;
    }
  }

  if (now - e.hitTime > 650 && zombie.isActiveAnim('die')) {
    result = true;
  }
  return {
    removeZombie: result,
  };
};

const pollZombieFallBack = (props: { delta: number; now: number; e: PollHitEvent }) => {
  const { delta, now, e } = props;
  let result = false;
  const { zombie } = e;
  if (!e.flashSet) {
    zombie.setRedFilter();
    e.flashSet = true;
    zombie.setAnimation('fall');
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
    zombie.setAnimation('idle');
    result = true;
  }
  return {
    removeZombie: result,
  };
};

const gunZombieDieAnim = (props: { delta: number; now: number; e: GunHitEvent }) => {
  const { delta, now, e } = props;
  const { zombie } = e;

  if (!e.flashSet) {
    zombie.setRedFilter();
    e.flashSet = true;
    setTimeout(() => {
      zombie.ctr.filters = [];
    }, 75);
  }
  if (!zombie.isActiveAnim('die')) {
    zombie.setAnimation('die');
  }

  let result = false;

  if (zombie.isActiveAnim('die')) {
    const percent = e.fall.curr / e.fall.max;

    // smaller knockback than poll
    let easedSpeed = e.fall.speed * (0.6 - percent * 0.4);
    easedSpeed = easedSpeed > 10 ? easedSpeed : 10;

    const moveDist = delta * easedSpeed;

    e.fall.curr += moveDist;
    if (e.direction === 'right') zombie.ctr.x += moveDist * 0.5;
    else zombie.ctr.x -= moveDist * 0.5;

    zombie.ctr.y -= moveDist * 0.1;
  }

  if (now - e.hitTime > 500 && zombie.isActiveAnim('die')) {
    result = true;
  }

  return { removeZombie: result };
};

const gunZombieFlinch = (props: { delta: number; now: number; e: GunHitEvent }) => {
  const { delta, now, e } = props;
  let result = false;
  const { zombie } = e;

  if (!e.flashSet) {
    zombie.setRedFilter();
    e.flashSet = true;
    zombie.setAnimation('hitDirection');
  }

  if (zombie.hasFilter && now - e.hitTime > 50) {
    zombie.ctr.filters = [];
  }

  if (zombie.isActiveAnim('hitDirection') && e.fall.curr < e.fall.max) {
    const percent = e.fall.curr / e.fall.max;
    let easedSpeed = e.fall.speed * (2.8 - percent * 2);
    easedSpeed = easedSpeed > 8 ? easedSpeed : 8;

    const moveDist = delta * easedSpeed;

    e.fall.curr += moveDist;
    if (e.direction === 'right') zombie.ctr.x += moveDist * 0.1;
    else zombie.ctr.x -= moveDist * 0.4;
  }

  if (now - e.hitTime > 500) {
    zombie.setAnimation('idle');
    result = true;
  }

  return { removeZombie: result };
};

export const createZombieHitSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const bus = di.eventBus();

  const gunHitEventDict = new Map<string, GunHitEvent>();
  const pollHitEventDict = new Map<string, PollHitEvent>();

  bus.on('zombieHit', (e) => {
    const zombie = entityStore.getById(e.id) as ZombieOneEntity;
    if (!zombie) return;

    zombie.recieveDamage(e.damage);

    if (zombie.health <= 0 && e.direction === 'left') {
      e.direction === 'left' ? zombie.faceRight() : zombie.faceLeft();
    }

    if (e.type === 'poll') {
      const distFall = randNum(2.1 * e.damage, 3.5 * e.damage);
      pollHitEventDict.set(zombie.id, {
        zombie: zombie,
        direction: e.direction,
        hitTime: performance.now(),
        flashSet: false,
        fall: {
          max: distFall,
          speed: distFall * 0.4,
          curr: 0,
        },
      });
    } else if (e.type === 'gun') {
      const distFall = randNum(0.25 * e.damage, 1 * e.damage);
      gunHitEventDict.set(zombie.id, {
        zombie: zombie,
        direction: e.direction,
        hitTime: performance.now(),
        flashSet: false,
        fall: {
          max: distFall,
          speed: distFall * 0.4,
          curr: 0,
        },
      });
    } else {
      throw new Error(`unknown zombieHit type: ${e.type}`);
    }
  });

  return {
    name: () => 'zombie-hit-system',
    update: (delta: number) => {
      if (pollHitEventDict.size === 0 && gunHitEventDict.size === 0) return;

      const now = performance.now();

      for (const e of gunHitEventDict.values()) {
        const { zombie } = e;

        if (zombie.health <= 0) {
          const { removeZombie } = gunZombieDieAnim({ delta, now, e });
          if (removeZombie) {
            entityStore.remove(zombie);
            gunHitEventDict.delete(zombie.id);
          }
        } else {
          const { removeZombie } = gunZombieFlinch({ delta, now, e });
          if (removeZombie) gunHitEventDict.delete(zombie.id);
        }
      }

      for (const e of pollHitEventDict.values()) {
        const { zombie } = e;

        if (zombie.health <= 0) {
          const { removeZombie } = pollZombieDieAnim({ delta, now, e });
          if (removeZombie) {
            entityStore.remove(zombie);
            pollHitEventDict.delete(zombie.id);
          }
        }

        if (zombie.health > 0) {
          const { removeZombie } = pollZombieFallBack({ delta, now, e });
          if (removeZombie) pollHitEventDict.delete(zombie.id);
        }
      }
    },
  };
};
