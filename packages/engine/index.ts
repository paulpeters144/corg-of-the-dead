import { openingScene } from './scenes/opening/_main';
import type { IInput } from './util/control/input.control';
import { createDiContainer } from './util/di-container';

export { calculator } from './calculator';

export const createEngine = (props: { canvas: HTMLCanvasElement; inputAdaptor?: (input: IInput) => void }) => {
  const { canvas, inputAdaptor } = props;
  const di = createDiContainer();
  const run = async () => {
    try {
      const appRef = di.appRef();
      await appRef.init({
        backgroundColor: '#000000',
        resolution: 1,
        autoDensity: true,
        antialias: true,
        canvas: canvas,
      });

      const input = di.input();
      const sceneEngine = di.sceneEngine();

      inputAdaptor?.(input);

      sceneEngine.next(() => openingScene(di));
    } catch (error) {
      console.error(error);
    }
  };
  return {
    run,
    constants: () => di.gameConstants(),
    appRef: () => di.appRef(),
  };
};
