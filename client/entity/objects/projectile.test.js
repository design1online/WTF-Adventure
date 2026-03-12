import Projectile from './projectile';
import Entity from '../entity';

jest.mock('@/client/lib/log', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Projectile', () => {
  let projectile;
  let mockOwner;

  beforeEach(() => {
    mockOwner = { id: 1, x: 0, y: 0 };
    projectile = new Projectile(99, 'arrow', mockOwner, 'Arrow');
  });

  test('extends Entity', () => {
    expect(projectile).toBeInstanceOf(Entity);
  });

  test('constructor sets properties', () => {
    expect(projectile.owner).toBe(mockOwner);
    expect(projectile.name).toBe('Arrow');
    expect(projectile.speed).toBe(200);
    expect(projectile.static).toBe(false);
    expect(projectile.dynamic).toBe(false);
    expect(projectile.angle).toBe(0);
  });

  test('getId() returns id', () => {
    expect(projectile.getId()).toBe(99);
  });

  test('getSpeed() returns speed', () => {
    expect(projectile.getSpeed()).toBe(200);
  });

  test('hasPath() returns false initially', () => {
    expect(projectile.hasPath()).toBe(false);
  });

  test('setStart() updates startX/Y and gridPosition', () => {
    projectile.setStart(32, 48);
    expect(projectile.startX).toBe(32);
    expect(projectile.startY).toBe(48);
  });

  test('setDestination() marks as static and sets dest', () => {
    projectile.x = 0;
    projectile.y = 0;
    projectile.setDestination(100, 100);
    expect(projectile.static).toBe(true);
    expect(projectile.destX).toBe(100);
    expect(projectile.destY).toBe(100);
  });

  test('updateTarget() updates destination', () => {
    projectile.updateTarget(50, 75);
    expect(projectile.destX).toBe(50);
    expect(projectile.destY).toBe(75);
  });

  test('updateAngle() computes angle correctly', () => {
    projectile.x = 0;
    projectile.y = 0;
    projectile.destX = 0;
    projectile.destY = 10;
    projectile.updateAngle();
    const expected = Math.atan2(10, 0) * (180 / Math.PI) - 90;
    expect(projectile.angle).toBeCloseTo(expected, 5);
  });

  test('impact() calls impactCallback if set', () => {
    const cb = jest.fn();
    projectile.onImpact(cb);
    projectile.impact();
    expect(cb).toHaveBeenCalled();
  });

  test('impact() does not throw when no callback', () => {
    expect(() => projectile.impact()).not.toThrow();
  });

  test('setTarget() sets dynamic and destX/Y', () => {
    const target = { x: 200, y: 300, type: 'mob', onMove: jest.fn() };
    projectile.x = 0;
    projectile.y = 0;
    projectile.setTarget(target);
    expect(projectile.dynamic).toBe(true);
    expect(projectile.destX).toBe(200);
    expect(projectile.destY).toBe(300);
  });

  test('setTarget() returns false for null target', () => {
    expect(projectile.setTarget(null)).toBe(false);
  });
});
