import { CameraOrbEntity } from '../entity/entity.camera-orb';
import { OdaEntity } from '../entity/entity.oda';
import type { IDiContainer } from '../util/di-container';
import type { ISystem } from './system.agg';

export const createCamOrbSystem = (di: IDiContainer): ISystem => {
  const oda = di.entityStore().first(OdaEntity);
  const orb = di.entityStore().first(CameraOrbEntity);
  if (!oda) throw new Error('create cam orb with no oda entity');
  if (!orb) throw new Error('created cam orb with no orb');
  const orbOffSet = 25;
  return {
    name: () => 'cam-orb-system',
    update: (_: number) => {
      if (oda.isFacingRight) {
        orb.ctr.position.set(oda.ctr.x + oda.ctr.width + orbOffSet, oda.ctr.y + oda.ctr.height / 2);
      }

      if (!oda.isFacingRight) {
        orb.ctr.position.set(oda.ctr.x - orbOffSet, oda.ctr.y + oda.ctr.height / 2);
      }
    },
  };
};
