export interface ISystem {
  name: () => string;
  update: (delta: number) => void;
}

export interface ISystemAgg {
  update: (delta: number) => void;
  add: (...systems: ISystem[]) => void;
  remove: (...systems: ISystem[]) => void;
  clearAll: () => void;
  getAll: () => ISystem[];
}

export const createSystemAgg = (): ISystemAgg => {
  let _systemsArr: ISystem[] = [];

  return {
    update: (delta: number) => {
      for (let i = 0; i < _systemsArr.length; i++) {
        _systemsArr[i].update(delta);
      }
    },
    add: (...systems: ISystem[]) => {
      for (const system of systems) {
        const hasSystemAlready = _systemsArr.find((s) => s.name() === system.name());
        if (hasSystemAlready) {
          throw new Error('only a sinlge isntance of a system can run');
        }
        _systemsArr.push(system);
      }
    },
    remove: (...systems: ISystem[]) => {
      const toRemove = new Set(systems.map((s) => s.name()));
      _systemsArr = _systemsArr.filter((s) => !toRemove.has(s.name()));
    },
    clearAll: () => {
      _systemsArr.length = 0;
    },
    getAll: () => {
      return _systemsArr;
    },
  };
};
