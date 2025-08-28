import * as PIXI from 'pixi.js';
import { createEntityStore, type IEntityStore } from '../entity/entity.store';
import { createSceneEngine, type ISceneEngine } from '../scenes/scene-engine';
import { createSystemAgg, type ISystemAgg } from '../systems/system.agg';
import { createAssetLoader, type IAssetLoader } from './asset-loader';
import { createCamera, type ICamera } from './camera';
import { createInputController, type IInput } from './control/input.control';
import { createEventBus, type IEventBus } from './event-bus';
import { getGameConstants, type IGameConstants } from './game.constants';
import { createGunFactory, type IGunFactory } from '../factory/factory.weapon';

export interface IDiContainer {
  appRef: () => PIXI.Application;
  assetLoader: () => IAssetLoader;
  camera: () => ICamera;
  entityStore: () => IEntityStore;
  eventBus: () => IEventBus;
  input: () => IInput;
  gameConstants: () => IGameConstants;
  gameRef: () => PIXI.Container;
  gunFactory: () => IGunFactory;
  sceneEngine: () => ISceneEngine;
  systemAgg: () => ISystemAgg;
}

const diContainer = (): IDiContainer => {
  let _appRef: PIXI.Application | undefined;
  let _eventBus: IEventBus | undefined;
  let _entityStore: IEntityStore | undefined;
  let _gameRef: PIXI.Container | undefined;
  let _gunFactory: IGunFactory | undefined;
  let _input: IInput | undefined;
  let _cameara: ICamera | undefined;
  let _assetLoader: IAssetLoader | undefined;
  let _sceneEngine: ISceneEngine | undefined;
  let _systemAgg: ISystemAgg | undefined;

  const appRef = () => {
    if (!_appRef) {
      _appRef = new PIXI.Application();
    }
    return _appRef;
  };

  const assetLoader = (): IAssetLoader => {
    if (!_assetLoader) {
      _assetLoader = createAssetLoader();
    }
    return _assetLoader;
  };

  const camera = () => {
    if (!_cameara) {
      _cameara = createCamera(appRef(), gameRef(), gameConstants());
    }
    return _cameara;
  };

  const eventBus = () => {
    if (!_eventBus) {
      _eventBus = createEventBus();
    }
    return _eventBus;
  };

  const entityStore = () => {
    if (!_entityStore) {
      _entityStore = createEntityStore(gameRef());
    }
    return _entityStore;
  };

  const input = () => {
    if (!_input) {
      _input = createInputController();
    }
    return _input;
  };

  const gameConstants = () => getGameConstants();

  const gameRef = () => {
    if (!_gameRef) {
      _gameRef = new PIXI.Container();
    }
    return _gameRef;
  };

  const gunFactory = () => {
    if (!_gunFactory) {
      _gunFactory = createGunFactory(assetLoader())
    }
    return _gunFactory;
  }

  const sceneEngine = () => {
    if (!_sceneEngine) {
      _sceneEngine = createSceneEngine(gameRef());
    }
    return _sceneEngine;
  };

  const systemAgg = () => {
    if (!_systemAgg) {
      _systemAgg = createSystemAgg();
    }
    return _systemAgg;
  };

  return {
    appRef,
    assetLoader,
    camera,
    entityStore,
    eventBus,
    input,
    gameConstants,
    gameRef,
    gunFactory,
    sceneEngine,
    systemAgg,
  };
};

export const createDiContainer = (): IDiContainer => {
  return diContainer();
};
