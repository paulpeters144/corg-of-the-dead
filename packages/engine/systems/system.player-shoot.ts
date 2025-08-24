import { OdaEntity } from "../entity/entity.oda";
import type { IDiContainer } from "../util/di-container";
import type { ISystem } from "./system.agg";

export const createPlayerShootSystem = (di: IDiContainer): ISystem => {
  const input = di.input()
  const oda = di.entityStore().first(OdaEntity);
  if (!oda) throw new Error('create cam orb with no oda entity')
  return {
    name: () => 'player-shoot-system',
    update: (_: number) => {
      if (input.shoot.is.pressed && !oda.isShooting) {
        oda.setShoot();
      }
    }
  }
}
