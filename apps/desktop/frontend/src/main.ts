// import { Application, Assets, Container, Sprite } from 'pixi.js';
// import bunnyUrl from '@package/assets/images/bunny.png';

// (async () => {
//   const app = new Application();
//   await app.init({ background: '#1099bb', resizeTo: window });
//   document.body.appendChild(app.canvas);

//   const container = new Container();
//   app.stage.addChild(container);

//   const texture = await Assets.load(bunnyUrl);

//   for (let i = 0; i < 25; i++) {
//     const bunny = new Sprite(texture);
//     bunny.x = (i % 5) * 40;
//     bunny.y = Math.floor(i / 5) * 40;
//     container.addChild(bunny);
//   }

//   container.x = app.screen.width / 2;
//   container.y = app.screen.height / 2;
//   container.pivot.x = container.width / 2;
//   container.pivot.y = container.height / 2;

//   app.ticker.add((time) => {
//     container.rotation -= 0.01 * time.deltaTime;
//   });
// })();

import { createEngine } from '@package/engine';
import type * as PIXI from 'pixi.js';

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
  const gameEngine = createEngine({ canvas });
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
