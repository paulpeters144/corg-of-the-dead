import type * as PIXI from 'pixi.js';

type Point = { x: number; y: number };

export const isCloseBy = (target: Point, candidate: Point, dx = 66, dy = 150): boolean => {
  return Math.abs(candidate.x - target.x) < dx && Math.abs(candidate.y - target.y) < dy;
};

export const byDistanceAsc = (target: Point) => {
  return (a: { center: Point; rect: PIXI.Rectangle }, b: { center: Point; rect: PIXI.Rectangle }) => {
    const distA = (a.center.x - target.x) ** 2 + (a.center.y - target.y) ** 2;
    const distB = (b.center.x - target.x) ** 2 + (b.center.y - target.y) ** 2;
    return distA - distB;
  };
};

export const randNum = (min: number, max: number) => {
  const step1 = Math.random() * (max - min + 1);
  return Math.floor(step1) + min;
};
