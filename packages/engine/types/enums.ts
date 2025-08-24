export const ZLayer = {
  b1: 0,
  b2: 1,
  b3: 2,
  b4: 3,
  b5: 4,
  m1: 5,
  m2: 6,
  m3: 7,
  m4: 8,
  m5: 9,
  t1: 10,
  t2: 11,
  t3: 12,
  t4: 13,
  t5: 14,
} as const;

export type ZLayer = (typeof ZLayer)[keyof typeof ZLayer];
