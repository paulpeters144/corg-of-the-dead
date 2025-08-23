export const ZLayer = {
  b1: 0,
  b2: 1,
  btm: 2,
  b4: 3,
  b5: 4,
  m1: 5,
  m2: 6,
  mid: 7,
  m4: 8,
  m5: 9,
  t1: 10,
  t2: 11,
  top: 12,
  t4: 13,
  t5: 14,
} as const;

export type ZLayer = (typeof ZLayer)[keyof typeof ZLayer];
