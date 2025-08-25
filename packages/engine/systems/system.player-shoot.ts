import { OdaEntity } from '../entity/entity.oda';
import type { IInput } from '../util/control/input.control';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

let shotFired = false;
let lastShot = 0;
const _handleNonAutomaticFiring = (props: { oda: OdaEntity; input: IInput }) => {
  const { oda, input } = props;
  if (!oda.gun) return;

  const now = performance.now();
  if (now - lastShot < oda.gun.fireRate) return;

  if (input.shoot.is.pressed && !shotFired && !oda.isShooting) {
    oda.setShoot();
    shotFired = true;
    lastShot = performance.now();
    // bus.fire('camShake', {
    //   duration: ,
    //   magnitude: 3,
    // })
  }

  if (shotFired && input.shoot.is.released) {
    shotFired = false;
  }
};

const _handleAutomaticFiring = (props: { oda: OdaEntity; input: IInput }) => {
  const { oda, input } = props;
  if (!oda.gun) return;

  const now = performance.now();
  if (now - lastShot < oda.gun.fireRate) return;

  if (input.shoot.is.pressed && !oda.isShooting) {
    oda.setShoot();
    lastShot = performance.now();
    // bus.fire('camShake', {
    //   duration: ,
    //   magnitude: 3,
    // })
  }
};

export const createPlayerShootSystem = (di: IDiContainer): ISystem => {
  const input = di.input();
  const _bus = di.eventBus();
  const oda = di.entityStore().first(OdaEntity);
  if (!oda) throw new Error('create cam orb with no oda entity');
  return {
    name: () => 'player-shoot-system',
    update: (_: number) => {
      if (!oda.gun) return;

      if (oda.gun.isAutomatic) {
        _handleAutomaticFiring({ oda, input });
      }

      if (!oda.gun.isAutomatic) {
        _handleNonAutomaticFiring({ oda, input });
      }
    },
  };
};
