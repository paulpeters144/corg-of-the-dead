import { createEngine } from '@package/engine';
import type * as PIXI from 'pixi.js';
import { adaptToWeb as inputAdaptor } from './input-adaptor';

const getCanvas = () => {
  const result = document.getElementById('game');
  if (!result) throw new Error("couldn't find game canvas");
  return result as HTMLCanvasElement;
};

const resizeApp = (props: {
  appRef: PIXI.Application;
  canvas: HTMLCanvasElement;
  virtSize: { width: number; height: number };
}) => {
  const { appRef: app, canvas, virtSize } = props;
  const targetAspect = virtSize.width / virtSize.height;
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const windowAspect = winW / winH;

  let newWidth: number;
  let newHeight: number;
  if (windowAspect > targetAspect) {
    newHeight = winH;
    newWidth = newHeight * targetAspect;
  } else {
    newWidth = winW;
    newHeight = newWidth / targetAspect;
  }

  app.renderer.resize(newWidth, newHeight);

  const scaleX = newWidth / virtSize.width;
  const scaleY = newHeight / virtSize.height;
  app.stage.scale.set(scaleX * 0.95, scaleY * 0.92);

  canvas.style.width = `${newWidth}px`;
  canvas.style.height = `${newHeight}px`;
  canvas.style.display = 'block';
  canvas.style.margin = 'auto';
};

const main = () => {
  const canvas = getCanvas();
  const gameEngine = createEngine({ canvas, inputAdaptor });
  const appRef = gameEngine.appRef();

  const virtSize = {
    width: gameEngine.constants().virtualGameWidth,
    height: gameEngine.constants().virtualGameHeight,
  };

  const resizer = () => resizeApp({ appRef, canvas, virtSize });
  setTimeout(resizer, 150);
  window.onresize = () => resizer();

  gameEngine.run();
};

main();
