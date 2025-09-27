import { describe, expect, it } from 'vitest';
import {
  Box,
  Circle,
  isSeparatingAxis,
  Polygon,
  pointInCircle,
  pointInPolygon,
  Response,
  testCircleCircle,
  testCirclePolygon,
  testPolygonCircle,
  testPolygonPolygon,
  Vector,
} from './index';

describe('Vector', () => {
  describe('constructor', () => {
    it('should create vector with default values', () => {
      const v = new Vector();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it('should create vector with specified values', () => {
      const v = new Vector(5, 10);
      expect(v.x).toBe(5);
      expect(v.y).toBe(10);
    });

    it('should handle undefined y value', () => {
      const v = new Vector(5);
      expect(v.x).toBe(5);
      expect(v.y).toBe(0);
    });
  });

  describe('copy', () => {
    it('should copy values from another vector', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 2);
      v2.copy(v1);
      expect(v2.x).toBe(3);
      expect(v2.y).toBe(4);
    });

    it('should return this for chaining', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 2);
      const result = v2.copy(v1);
      expect(result).toBe(v2);
    });
  });

  describe('clone', () => {
    it('should create a new vector with same values', () => {
      const v1 = new Vector(3, 4);
      const v2 = v1.clone();
      expect(v2.x).toBe(3);
      expect(v2.y).toBe(4);
      expect(v2).not.toBe(v1);
    });
  });

  describe('perp', () => {
    it('should rotate vector 90 degrees clockwise', () => {
      const v = new Vector(3, 4);
      v.perp();
      expect(v.x).toBe(4);
      expect(v.y).toBe(-3);
    });

    it('should return this for chaining', () => {
      const v = new Vector(3, 4);
      const result = v.perp();
      expect(result).toBe(v);
    });
  });

  describe('rotate', () => {
    it('should rotate vector by specified angle', () => {
      const v = new Vector(1, 0);
      v.rotate(Math.PI / 2);
      expect(v.x).toBeCloseTo(0, 10);
      expect(v.y).toBeCloseTo(1, 10);
    });

    it('should handle negative angles', () => {
      const v = new Vector(1, 0);
      v.rotate(-Math.PI / 2);
      expect(v.x).toBeCloseTo(0, 10);
      expect(v.y).toBeCloseTo(-1, 10);
    });

    it('should return this for chaining', () => {
      const v = new Vector(1, 0);
      const result = v.rotate(Math.PI / 2);
      expect(result).toBe(v);
    });
  });

  describe('reverse', () => {
    it('should reverse vector direction', () => {
      const v = new Vector(3, 4);
      v.reverse();
      expect(v.x).toBe(-3);
      expect(v.y).toBe(-4);
    });

    it('should return this for chaining', () => {
      const v = new Vector(3, 4);
      const result = v.reverse();
      expect(result).toBe(v);
    });
  });

  describe('normalize', () => {
    it('should normalize vector to unit length', () => {
      const v = new Vector(3, 4);
      v.normalize();
      expect(v.len()).toBeCloseTo(1, 10);
      expect(v.x).toBeCloseTo(0.6, 10);
      expect(v.y).toBeCloseTo(0.8, 10);
    });

    it('should handle zero vector', () => {
      const v = new Vector(0, 0);
      v.normalize();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it('should return this for chaining', () => {
      const v = new Vector(3, 4);
      const result = v.normalize();
      expect(result).toBe(v);
    });
  });

  describe('add', () => {
    it('should add another vector', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 2);
      v1.add(v2);
      expect(v1.x).toBe(4);
      expect(v1.y).toBe(6);
    });

    it('should return this for chaining', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 2);
      const result = v1.add(v2);
      expect(result).toBe(v1);
    });
  });

  describe('sub', () => {
    it('should subtract another vector', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 2);
      v1.sub(v2);
      expect(v1.x).toBe(2);
      expect(v1.y).toBe(2);
    });

    it('should return this for chaining', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 2);
      const result = v1.sub(v2);
      expect(result).toBe(v1);
    });
  });

  describe('scale', () => {
    it('should scale by single factor', () => {
      const v = new Vector(3, 4);
      v.scale(2);
      expect(v.x).toBe(6);
      expect(v.y).toBe(8);
    });

    it('should scale by different x and y factors', () => {
      const v = new Vector(3, 4);
      v.scale(2, 3);
      expect(v.x).toBe(6);
      expect(v.y).toBe(12);
    });

    it('should return this for chaining', () => {
      const v = new Vector(3, 4);
      const result = v.scale(2);
      expect(result).toBe(v);
    });
  });

  describe('project', () => {
    it('should project onto another vector', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 0);
      v1.project(v2);
      expect(v1.x).toBe(3);
      expect(v1.y).toBe(0);
    });

    it('should return this for chaining', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 0);
      const result = v1.project(v2);
      expect(result).toBe(v1);
    });
  });

  describe('projectN', () => {
    it('should project onto unit vector', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 0);
      v1.projectN(v2);
      expect(v1.x).toBe(3);
      expect(v1.y).toBe(0);
    });

    it('should return this for chaining', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(1, 0);
      const result = v1.projectN(v2);
      expect(result).toBe(v1);
    });
  });

  describe('reflect', () => {
    it('should reflect across axis', () => {
      const v1 = new Vector(2, 1);
      const axis = new Vector(1, 0);
      v1.reflect(axis);
      expect(v1.x).toBe(2);
      expect(v1.y).toBe(-1);
    });

    it('should return this for chaining', () => {
      const v1 = new Vector(2, 1);
      const axis = new Vector(1, 0);
      const result = v1.reflect(axis);
      expect(result).toBe(v1);
    });
  });

  describe('reflectN', () => {
    it('should reflect across unit axis', () => {
      const v1 = new Vector(2, 1);
      const axis = new Vector(1, 0);
      v1.reflectN(axis);
      expect(v1.x).toBe(2);
      expect(v1.y).toBe(-1);
    });

    it('should return this for chaining', () => {
      const v1 = new Vector(2, 1);
      const axis = new Vector(1, 0);
      const result = v1.reflectN(axis);
      expect(result).toBe(v1);
    });
  });

  describe('dot', () => {
    it('should calculate dot product', () => {
      const v1 = new Vector(3, 4);
      const v2 = new Vector(2, 1);
      const result = v1.dot(v2);
      expect(result).toBe(10);
    });

    it('should handle perpendicular vectors', () => {
      const v1 = new Vector(1, 0);
      const v2 = new Vector(0, 1);
      const result = v1.dot(v2);
      expect(result).toBe(0);
    });
  });

  describe('len2', () => {
    it('should calculate squared length', () => {
      const v = new Vector(3, 4);
      const result = v.len2();
      expect(result).toBe(25);
    });

    it('should handle zero vector', () => {
      const v = new Vector(0, 0);
      const result = v.len2();
      expect(result).toBe(0);
    });
  });

  describe('len', () => {
    it('should calculate length', () => {
      const v = new Vector(3, 4);
      const result = v.len();
      expect(result).toBe(5);
    });

    it('should handle zero vector', () => {
      const v = new Vector(0, 0);
      const result = v.len();
      expect(result).toBe(0);
    });
  });
});

describe('Circle', () => {
  describe('constructor', () => {
    it('should create circle with default values', () => {
      const c = new Circle();
      expect(c.pos.x).toBe(0);
      expect(c.pos.y).toBe(0);
      expect(c.r).toBe(0);
      expect(c.offset.x).toBe(0);
      expect(c.offset.y).toBe(0);
    });

    it('should create circle with specified values', () => {
      const pos = new Vector(5, 10);
      const c = new Circle(pos, 15);
      expect(c.pos).toBe(pos);
      expect(c.r).toBe(15);
    });
  });

  describe('getAABBAsBox', () => {
    it('should return correct AABB box', () => {
      const c = new Circle(new Vector(10, 10), 5);
      const box = c.getAABBAsBox();
      expect(box.pos.x).toBe(5);
      expect(box.pos.y).toBe(5);
      expect(box.w).toBe(10);
      expect(box.h).toBe(10);
    });

    it('should handle offset', () => {
      const c = new Circle(new Vector(10, 10), 5);
      c.setOffset(new Vector(2, 3));
      const box = c.getAABBAsBox();
      expect(box.pos.x).toBe(7);
      expect(box.pos.y).toBe(8);
    });
  });

  describe('getAABB', () => {
    it('should return AABB as polygon', () => {
      const c = new Circle(new Vector(10, 10), 5);
      const poly = c.getAABB();
      expect(poly).toBeInstanceOf(Polygon);
      expect(poly.points.length).toBe(4);
    });
  });

  describe('setOffset', () => {
    it('should set offset and return this', () => {
      const c = new Circle();
      const offset = new Vector(5, 5);
      const result = c.setOffset(offset);
      expect(c.offset).toBe(offset);
      expect(result).toBe(c);
    });
  });
});

describe('Box', () => {
  describe('constructor', () => {
    it('should create box with default values', () => {
      const b = new Box();
      expect(b.pos.x).toBe(0);
      expect(b.pos.y).toBe(0);
      expect(b.w).toBe(0);
      expect(b.h).toBe(0);
    });

    it('should create box with specified values', () => {
      const pos = new Vector(5, 10);
      const b = new Box(pos, 20, 30);
      expect(b.pos).toBe(pos);
      expect(b.w).toBe(20);
      expect(b.h).toBe(30);
    });
  });

  describe('toPolygon', () => {
    it('should convert to polygon with 4 vertices', () => {
      const b = new Box(new Vector(0, 0), 10, 20);
      const poly = b.toPolygon();
      expect(poly.points.length).toBe(4);
      expect(poly.points[0].x).toBe(0);
      expect(poly.points[0].y).toBe(0);
      expect(poly.points[1].x).toBe(10);
      expect(poly.points[1].y).toBe(0);
      expect(poly.points[2].x).toBe(10);
      expect(poly.points[2].y).toBe(20);
      expect(poly.points[3].x).toBe(0);
      expect(poly.points[3].y).toBe(20);
    });
  });
});

describe('Polygon', () => {
  describe('constructor', () => {
    it('should create polygon with default values', () => {
      const p = new Polygon();
      expect(p.pos.x).toBe(0);
      expect(p.pos.y).toBe(0);
      expect(p.angle).toBe(0);
      expect(p.offset.x).toBe(0);
      expect(p.offset.y).toBe(0);
      expect(p.points.length).toBe(0);
    });

    it('should create polygon with specified values', () => {
      const pos = new Vector(5, 10);
      const points = [new Vector(0, 0), new Vector(10, 0), new Vector(5, 10)];
      const p = new Polygon(pos, points);
      expect(p.pos).toBe(pos);
      expect(p.points).toBe(points);
    });
  });

  describe('setPoints', () => {
    it('should set points and calculate properties', () => {
      const p = new Polygon();
      const points = [new Vector(0, 0), new Vector(10, 0), new Vector(5, 10)];
      const result = p.setPoints(points);
      expect(p.points).toBe(points);
      expect(p.calcPoints.length).toBe(3);
      expect(p.edges.length).toBe(3);
      expect(p.normals.length).toBe(3);
      expect(result).toBe(p);
    });

    it('should remove consecutive duplicate points', () => {
      const p = new Polygon();
      const points = [new Vector(0, 0), new Vector(0, 0), new Vector(10, 0), new Vector(5, 10)];
      p.setPoints(points);
      expect(points.length).toBe(3);
    });
  });

  describe('setAngle', () => {
    it('should set angle and recalculate', () => {
      const p = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(5, 10)]);
      const result = p.setAngle(Math.PI / 2);
      expect(p.angle).toBe(Math.PI / 2);
      expect(result).toBe(p);
    });
  });

  describe('setOffset', () => {
    it('should set offset and recalculate', () => {
      const p = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(5, 10)]);
      const offset = new Vector(5, 5);
      const result = p.setOffset(offset);
      expect(p.offset).toBe(offset);
      expect(result).toBe(p);
    });
  });

  describe('rotate', () => {
    it('should rotate original points', () => {
      const p = new Polygon(new Vector(), [new Vector(1, 0), new Vector(0, 1)]);
      const result = p.rotate(Math.PI / 2);
      expect(p.points[0].x).toBeCloseTo(0, 10);
      expect(p.points[0].y).toBeCloseTo(1, 10);
      expect(result).toBe(p);
    });
  });

  describe('translate', () => {
    it('should translate original points', () => {
      const p = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0)]);
      const result = p.translate(5, 5);
      expect(p.points[0].x).toBe(5);
      expect(p.points[0].y).toBe(5);
      expect(p.points[1].x).toBe(15);
      expect(p.points[1].y).toBe(5);
      expect(result).toBe(p);
    });
  });

  describe('getAABBAsBox', () => {
    it('should return correct AABB box', () => {
      const p = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(10, 20), new Vector(0, 20)]);
      const box = p.getAABBAsBox();
      expect(box.pos.x).toBe(0);
      expect(box.pos.y).toBe(0);
      expect(box.w).toBe(10);
      expect(box.h).toBe(20);
    });
  });

  describe('getAABB', () => {
    it('should return AABB as polygon', () => {
      const p = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(5, 10)]);
      const aabb = p.getAABB();
      expect(aabb).toBeInstanceOf(Polygon);
      expect(aabb.points.length).toBe(4);
    });
  });

  describe('getCentroid', () => {
    it('should calculate centroid for triangle', () => {
      const p = new Polygon(new Vector(), [new Vector(0, 0), new Vector(3, 0), new Vector(0, 3)]);
      const centroid = p.getCentroid();
      expect(centroid.x).toBeCloseTo(1, 5);
      expect(centroid.y).toBeCloseTo(1, 5);
    });

    it('should calculate centroid for rectangle', () => {
      const p = new Polygon(new Vector(), [new Vector(0, 0), new Vector(4, 0), new Vector(4, 2), new Vector(0, 2)]);
      const centroid = p.getCentroid();
      expect(centroid.x).toBeCloseTo(2, 5);
      expect(centroid.y).toBeCloseTo(1, 5);
    });
  });
});

describe('Response', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {
      const r = new Response();
      expect(r.a).toBeNull();
      expect(r.b).toBeNull();
      expect(r.overlapN).toBeInstanceOf(Vector);
      expect(r.overlapV).toBeInstanceOf(Vector);
      expect(r.aInB).toBe(true);
      expect(r.bInA).toBe(true);
      expect(r.overlap).toBe(Number.MAX_VALUE);
    });
  });

  describe('clear', () => {
    it('should reset values to defaults', () => {
      const r = new Response();
      r.aInB = false;
      r.bInA = false;
      r.overlap = 5;
      const result = r.clear();
      expect(r.aInB).toBe(true);
      expect(r.bInA).toBe(true);
      expect(r.overlap).toBe(Number.MAX_VALUE);
      expect(result).toBe(r);
    });
  });
});

describe('pointInCircle', () => {
  it('should return true for point inside circle', () => {
    const point = new Vector(5, 5);
    const circle = new Circle(new Vector(0, 0), 10);
    expect(pointInCircle(point, circle)).toBe(true);
  });

  it('should return false for point outside circle', () => {
    const point = new Vector(15, 15);
    const circle = new Circle(new Vector(0, 0), 10);
    expect(pointInCircle(point, circle)).toBe(false);
  });

  it('should return true for point on circle edge', () => {
    const point = new Vector(10, 0);
    const circle = new Circle(new Vector(0, 0), 10);
    expect(pointInCircle(point, circle)).toBe(true);
  });

  it('should handle circle offset', () => {
    const point = new Vector(7, 7);
    const circle = new Circle(new Vector(0, 0), 5);
    circle.setOffset(new Vector(5, 5));
    expect(pointInCircle(point, circle)).toBe(true);
  });
});

describe('pointInPolygon', () => {
  it('should return true for point inside polygon', () => {
    const point = new Vector(5, 5);
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    expect(pointInPolygon(point, polygon)).toBe(true);
  });

  it('should return false for point outside polygon', () => {
    const point = new Vector(15, 15);
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    expect(pointInPolygon(point, polygon)).toBe(false);
  });

  it('should handle triangular polygon', () => {
    const point = new Vector(5, 2);
    const polygon = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(5, 5)]);
    expect(pointInPolygon(point, polygon)).toBe(true);
  });
});

describe('testCircleCircle', () => {
  it('should return true for overlapping circles', () => {
    const c1 = new Circle(new Vector(0, 0), 5);
    const c2 = new Circle(new Vector(7, 0), 5);
    expect(testCircleCircle(c1, c2)).toBe(true);
  });

  it('should return false for non-overlapping circles', () => {
    const c1 = new Circle(new Vector(0, 0), 5);
    const c2 = new Circle(new Vector(15, 0), 5);
    expect(testCircleCircle(c1, c2)).toBe(false);
  });

  it('should return true for touching circles', () => {
    const c1 = new Circle(new Vector(0, 0), 5);
    const c2 = new Circle(new Vector(10, 0), 5);
    expect(testCircleCircle(c1, c2)).toBe(true);
  });

  it('should populate response object', () => {
    const c1 = new Circle(new Vector(0, 0), 5);
    const c2 = new Circle(new Vector(7, 0), 5);
    const response = new Response();
    const result = testCircleCircle(c1, c2, response);
    expect(result).toBe(true);
    expect(response.a).toBe(c1);
    expect(response.b).toBe(c2);
    expect(response.overlap).toBeCloseTo(3, 10);
    expect(response.overlapN.x).toBeCloseTo(1, 10);
    expect(response.overlapN.y).toBeCloseTo(0, 10);
  });

  it('should handle circles with offset', () => {
    const c1 = new Circle(new Vector(0, 0), 5);
    c1.setOffset(new Vector(2, 0));
    const c2 = new Circle(new Vector(10, 0), 5);
    expect(testCircleCircle(c1, c2)).toBe(true);
  });

  it('should detect one circle inside another', () => {
    const c1 = new Circle(new Vector(0, 0), 2);
    const c2 = new Circle(new Vector(1, 0), 5);
    const response = new Response();
    testCircleCircle(c1, c2, response);
    expect(response.aInB).toBe(true);
    expect(response.bInA).toBe(false);
  });
});

describe('testPolygonCircle', () => {
  it('should return true for overlapping polygon and circle', () => {
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    const circle = new Circle(new Vector(5, 5), 3);
    expect(testPolygonCircle(polygon, circle)).toBe(true);
  });

  it('should return false for non-overlapping polygon and circle', () => {
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    const circle = new Circle(new Vector(20, 20), 3);
    expect(testPolygonCircle(polygon, circle)).toBe(false);
  });

  it('should handle circle intersecting polygon edge', () => {
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    const circle = new Circle(new Vector(12, 5), 3);
    expect(testPolygonCircle(polygon, circle)).toBe(true);
  });

  it('should populate response object', () => {
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    const circle = new Circle(new Vector(12, 5), 3);
    const response = new Response();
    const result = testPolygonCircle(polygon, circle, response);
    expect(result).toBe(true);
    expect(response.a).toBe(polygon);
    expect(response.b).toBe(circle);
    expect(response.overlap).toBeGreaterThan(0);
  });

  it('should handle circle at polygon vertex', () => {
    const polygon = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(5, 10)]);
    const circle = new Circle(new Vector(1, 1), 2);
    expect(testPolygonCircle(polygon, circle)).toBe(true);
  });
});

describe('testCirclePolygon', () => {
  it('should return true for overlapping circle and polygon', () => {
    const circle = new Circle(new Vector(5, 5), 3);
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    expect(testCirclePolygon(circle, polygon)).toBe(true);
  });

  it('should return false for non-overlapping circle and polygon', () => {
    const circle = new Circle(new Vector(20, 20), 3);
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    expect(testCirclePolygon(circle, polygon)).toBe(false);
  });

  it('should populate response with correct order', () => {
    const circle = new Circle(new Vector(5, 5), 3);
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    const response = new Response();
    testCirclePolygon(circle, polygon, response);
    expect(response.a).toBe(circle);
    expect(response.b).toBe(polygon);
  });
});

describe('testPolygonPolygon', () => {
  it('should return true for overlapping polygons', () => {
    const p1 = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(10, 10), new Vector(0, 10)]);
    const p2 = new Polygon(new Vector(5, 5), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    expect(testPolygonPolygon(p1, p2)).toBe(true);
  });

  it('should return false for non-overlapping polygons', () => {
    const p1 = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(10, 10), new Vector(0, 10)]);
    const p2 = new Polygon(new Vector(20, 20), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    expect(testPolygonPolygon(p1, p2)).toBe(false);
  });

  it('should return true for touching polygons', () => {
    const p1 = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(10, 10), new Vector(0, 10)]);
    const p2 = new Polygon(new Vector(10, 0), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    expect(testPolygonPolygon(p1, p2)).toBe(true);
  });

  it('should populate response object', () => {
    const p1 = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(10, 10), new Vector(0, 10)]);
    const p2 = new Polygon(new Vector(5, 5), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    const response = new Response();
    const result = testPolygonPolygon(p1, p2, response);
    expect(result).toBe(true);
    expect(response.a).toBe(p1);
    expect(response.b).toBe(p2);
    expect(response.overlap).toBeGreaterThan(0);
    expect(response.overlapV.x).not.toBe(0);
  });

  it('should handle triangular polygons', () => {
    const p1 = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(5, 10)]);
    const p2 = new Polygon(new Vector(3, 3), [new Vector(0, 0), new Vector(10, 0), new Vector(5, 10)]);
    expect(testPolygonPolygon(p1, p2)).toBe(true);
  });

  it('should detect one polygon inside another', () => {
    const p1 = new Polygon(new Vector(2, 2), [new Vector(0, 0), new Vector(6, 0), new Vector(6, 6), new Vector(0, 6)]);
    const p2 = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(10, 10), new Vector(0, 10)]);
    const response = new Response();
    testPolygonPolygon(p1, p2, response);
    expect(response.aInB).toBe(true);
  });

  it('should handle rotated polygons', () => {
    const p1 = new Polygon(new Vector(), [new Vector(0, 0), new Vector(10, 0), new Vector(10, 10), new Vector(0, 10)]);
    const p2 = new Polygon(new Vector(5, 5), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    p2.setAngle(Math.PI / 4);
    expect(testPolygonPolygon(p1, p2)).toBe(true);
  });
});

describe('isSeparatingAxis', () => {
  it('should return true for separating axis', () => {
    const aPos = new Vector(0, 0);
    const bPos = new Vector(20, 0);
    const aPoints = [new Vector(0, 0), new Vector(5, 0), new Vector(5, 5), new Vector(0, 5)];
    const bPoints = [new Vector(0, 0), new Vector(5, 0), new Vector(5, 5), new Vector(0, 5)];
    const axis = new Vector(1, 0);
    expect(isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis)).toBe(true);
  });

  it('should return false for non-separating axis', () => {
    const aPos = new Vector(0, 0);
    const bPos = new Vector(3, 0);
    const aPoints = [new Vector(0, 0), new Vector(5, 0), new Vector(5, 5), new Vector(0, 5)];
    const bPoints = [new Vector(0, 0), new Vector(5, 0), new Vector(5, 5), new Vector(0, 5)];
    const axis = new Vector(1, 0);
    expect(isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis)).toBe(false);
  });

  it('should populate response when not separating', () => {
    const aPos = new Vector(0, 0);
    const bPos = new Vector(3, 0);
    const aPoints = [new Vector(0, 0), new Vector(5, 0), new Vector(5, 5), new Vector(0, 5)];
    const bPoints = [new Vector(0, 0), new Vector(5, 0), new Vector(5, 5), new Vector(0, 5)];
    const axis = new Vector(1, 0);
    const response = new Response();
    const result = isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis, response);
    expect(result).toBe(false);
    expect(response.overlap).toBeGreaterThan(0);
    expect(response.overlapN.x).toBe(1);
    expect(response.overlapN.y).toBe(0);
  });

  it('should handle vertical axis', () => {
    const aPos = new Vector(0, 0);
    const bPos = new Vector(0, 20);
    const aPoints = [new Vector(0, 0), new Vector(5, 0), new Vector(5, 5), new Vector(0, 5)];
    const bPoints = [new Vector(0, 0), new Vector(5, 0), new Vector(5, 5), new Vector(0, 5)];
    const axis = new Vector(0, 1);
    expect(isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis)).toBe(true);
  });
});

describe('Edge cases and complex scenarios', () => {
  it('should handle zero-radius circle', () => {
    const point = new Vector(5, 5);
    const circle = new Circle(new Vector(5, 5), 0);
    expect(pointInCircle(point, circle)).toBe(true);
  });

  it('should handle degenerate polygon', () => {
    const polygon = new Polygon(new Vector(), [new Vector(0, 0), new Vector(1, 0)]);
    const point = new Vector(0.5, 0);
    expect(pointInPolygon(point, polygon)).toBe(false);
  });

  it('should handle polygon with offset', () => {
    const polygon = new Polygon(new Vector(), [
      new Vector(0, 0),
      new Vector(10, 0),
      new Vector(10, 10),
      new Vector(0, 10),
    ]);
    polygon.setOffset(new Vector(5, 5));
    const point = new Vector(7, 7);
    expect(pointInPolygon(point, polygon)).toBe(true);
  });

  it('should handle very small overlap', () => {
    const c1 = new Circle(new Vector(0, 0), 5);
    const c2 = new Circle(new Vector(9.9999, 0), 5);
    const response = new Response();
    const result = testCircleCircle(c1, c2, response);
    expect(result).toBe(true);
    expect(response.overlap).toBeCloseTo(0.0001, 4);
  });

  it('should handle large numbers', () => {
    const c1 = new Circle(new Vector(1000000, 1000000), 50);
    const c2 = new Circle(new Vector(1000030, 1000000), 50);
    expect(testCircleCircle(c1, c2)).toBe(true);
  });

  it('should handle negative coordinates', () => {
    const c1 = new Circle(new Vector(-10, -10), 5);
    const c2 = new Circle(new Vector(-5, -10), 5);
    expect(testCircleCircle(c1, c2)).toBe(true);
  });

  it('should handle polygon rotation edge case', () => {
    const polygon = new Polygon(new Vector(), [
      new Vector(1, 0),
      new Vector(0, 1),
      new Vector(-1, 0),
      new Vector(0, -1),
    ]);
    polygon.setAngle(Math.PI);
    const circle = new Circle(new Vector(0, 0), 0.5);
    expect(testPolygonCircle(polygon, circle)).toBe(true);
  });

  it('should handle multiple response reuse', () => {
    const response = new Response();
    const c1 = new Circle(new Vector(0, 0), 5);
    const c2 = new Circle(new Vector(7, 0), 5);

    testCircleCircle(c1, c2, response);
    const firstOverlap = response.overlap;

    response.clear();
    const c3 = new Circle(new Vector(8, 0), 5);
    testCircleCircle(c1, c3, response);
    const secondOverlap = response.overlap;

    expect(firstOverlap).toBeGreaterThan(secondOverlap);
  });

  it('should handle concentric circles', () => {
    const c1 = new Circle(new Vector(0, 0), 10);
    const c2 = new Circle(new Vector(0, 0), 5);
    const response = new Response();
    testCircleCircle(c1, c2, response);
    expect(response.bInA).toBe(true);
    expect(response.aInB).toBe(false);
  });

  it('should handle identical circles', () => {
    const c1 = new Circle(new Vector(0, 0), 5);
    const c2 = new Circle(new Vector(0, 0), 5);
    const response = new Response();
    testCircleCircle(c1, c2, response);
    expect(response.aInB).toBe(true);
    expect(response.bInA).toBe(true);
    expect(response.overlap).toBe(10);
  });

  it('should handle polygon with many vertices', () => {
    const points = [];
    const numVertices = 16;
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      points.push(new Vector(Math.cos(angle) * 10, Math.sin(angle) * 10));
    }
    const polygon = new Polygon(new Vector(), points);
    const circle = new Circle(new Vector(0, 0), 5);
    expect(testPolygonCircle(polygon, circle)).toBe(true);
  });
});
